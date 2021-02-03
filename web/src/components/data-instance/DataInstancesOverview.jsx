import React, { Component, useEffect, useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import {
  shape, objectOf, string,
} from 'prop-types';
import { closeModal, fireModal } from 'store/actions/actionModalActions';
import { setPreconfiguredOPerations } from 'store/actions/userActions';
import { generateBreadCrumbs } from 'functions/helpers';
import { MLoadingSpinnerContainer } from 'components/ui/MLoadingSpinner';
import { filterPipelinesOnStatus } from 'functions/pipeLinesHelpers';
import DataInstanceActions from 'components/data-instance/DataInstanceActions';
import hooks from 'customHooks/useSelectedProject';
import Navbar from '../navbar/navbar';
import ProjectContainer from '../projectContainer';
import './dataInstanceOverview.css';
import Instruction from '../instruction/instruction';
import { getTimeCreatedAgo, parseToCamelCase } from '../../functions/dataParserHelpers';
import DataInstancesCard from './DataInstancesCard';

const DataInstanceOverview = (props) => {
  const {
    match: {
      params: { namespace, slug },
    },
    history,
    setPreconfiguredOPerations,
    fireModal,
    closeModal,
  } = props;

  const [selectedProject, isFetching] = hooks.useSelectedProject(namespace, slug);

  const { gid, id } = selectedProject;

  const [allDataInstances, setAllDataInstances] = useState([]);
  const [dataInstances, setDataInstances] = useState([]);

  const fetchPipelines = () => {
    if (id) {
      DataInstanceActions
        .getDataInstances(id, gid)
        .then((dataInstancesClassified) => {
          setAllDataInstances(dataInstancesClassified);
          setDataInstances(dataInstancesClassified);
        }).catch((err) => toastr.error('Error', err?.message));
    }
  };

  useEffect(() => {
    fetchPipelines();
  }, [id]);

  const customCrumbs = [
    {
      name: 'Data',
      href: `/${namespace}/${slug}`,
    },
    {
      name: 'Datasets',
      href: `/${namespace}/${slug}/-/datasets`,
    },
  ];

  const handleButtonFilterClick = (e) => setDataInstances(
    filterPipelinesOnStatus(e, allDataInstances),
  );

  if (isFetching) {
    return (
      <MLoadingSpinnerContainer active />
    );
  }

  return (
    <>
      <div>
        <Navbar />
        <ProjectContainer
          activeFeature="data"
          breadcrumbs={generateBreadCrumbs(selectedProject, customCrumbs)}
        />
        <Instruction
          id="DataInstanceOverview"
          titleText="Handling datasets:"
          paragraph={
              `A dataset is the result of an executed data pipeline. You can use this dataset directly as your source of data for an experiment
               or to create another data pipeline. Simply select the dataset in the branch dropdown while selecting your data.`
            }
        />
        <div className="main-content">
          <div id="buttons-container" className="left d-flex">
            <button
              id="all"
              type="button"
              className="active btn btn-switch btn-bg-light btn-label-sm my-auto mr-2"
              onClick={handleButtonFilterClick}
            >
              All
            </button>
            <button
              id="InProgress"
              type="button"
              className="btn btn-switch btn-bg-light btn-label-sm my-auto mr-2"
              onClick={handleButtonFilterClick}
            >
              In Progress
            </button>
            <button
              id="Success"
              type="button"
              className="btn btn-switch btn-bg-light btn-label-sm my-auto mr-2"
              onClick={handleButtonFilterClick}
            >
              Success
            </button>
            <button
              id="Failed"
              type="button"
              className="btn btn-switch btn-bg-light btn-bg-lightbtn-label-sm my-auto mr-2"
              onClick={handleButtonFilterClick}
            >
              Failed
            </button>
            <button
              id="Canceled"
              type="button"
              className="btn btn-switch btn-bg-light btn-bg-lightbtn-label-sm my-auto mr-2"
              onClick={handleButtonFilterClick}
            >
              Canceled
            </button>
          </div>
          {dataInstances
            .map((dataInstanceClassification) => {
              const instances = dataInstanceClassification.values.map((val) => {
                const timediff = getTimeCreatedAgo(val.commit.created_at, new Date());
                const bpipeline = parseToCamelCase(val.backendPipeline);
                return {
                  id: val.id,
                  pipelineBackendId: bpipeline.id,
                  currentState: val.status,
                  descTitle: val.name,
                  userName: val.commit.author_name,
                  commitId: val?.commit.id,
                  timeCreatedAgo: timediff,
                  projId: gid,
                  backendProjectId: id,
                  dataOperations: bpipeline.dataOperations,
                  backendInstanceId: bpipeline.dataInstanceId,
                  inputFiles: bpipeline.inputFiles,
                };
              });
              const firstValue = dataInstanceClassification.values[0];
              const InstanceName = firstValue && firstValue.name;

              if (instances.length === 0) {
                return null;
              }
              return (
                <DataInstancesCard
                  key={InstanceName}
                  name={InstanceName}
                  namespace={namespace}
                  slug={slug}
                  history={history}
                  setPreconfiguredOPerations={setPreconfiguredOPerations}
                  params={{
                    currentState: dataInstanceClassification.status,
                    instances,
                  }}
                  fetchPipelines={fetchPipelines}
                  fireModal={fireModal}
                  closeModal={closeModal}
                />
              );
            })}
        </div>
        <br />
        <br />
      </div>
    </>
  );
};

DataInstanceOverview.propTypes = {
  match: shape({
    params: shape({
      namespace: string.isRequired,
      slug: string.isRequired,
    }).isRequired,
  }).isRequired,
};

function mapStateToProps(state) {
  return {
    branches: state.branches,
  };
}

function mapActionsToProps(dispatch) {
  return {
    setPreconfiguredOPerations: bindActionCreators(setPreconfiguredOPerations, dispatch),
    fireModal: bindActionCreators(fireModal, dispatch),
    closeModal: bindActionCreators(closeModal, dispatch),
  };
}

export default connect(mapStateToProps, mapActionsToProps)(DataInstanceOverview);
