import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import Adapter from 'enzyme-adapter-react-16';
import { RepoFeatures } from '../components/repoFeatures';
import { projectsArrayMock, branchesMock } from '../testData';
import MDropdown from 'components/ui/MDropdown';

Enzyme.configure({ adapter: new Adapter() });

const setup = () => shallow(
  <RepoFeatures
    projects={projectsArrayMock.projects}
    branch="master"
    branches={branchesMock}
    path=""
    projectId={projectsArrayMock.projects.selectedProject.id}
    updateLastCommit={() => {}}
  />,
);

describe('There should render', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });
  it('renders without crashing given the required props', () => {
    const buttonsContainer = wrapper.find('#repo-features');
    expect(buttonsContainer).toHaveLength(1);
  });
});

describe('Dropdown appears on button click', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });
  it('renders without crashing given the required props', () => {
    wrapper
      .find(MDropdown)
      .first()
      .dive()
      .find('.m-dropdown-button button')
      .simulate('click');

    expect(
      wrapper
        .find(MDropdown)
        .first()
        .dive()
        .find('.m-dropdown-list-container'),
    ).toHaveLength(1);
  });
});

describe('The branches list should be displayed when dropdown button is clicked', () => {
  it('dropdown of branches appear', () => {
    const component = renderer
      .create(
        <MemoryRouter key="rerere">
          <RepoFeatures
            projects={projectsArrayMock.projects}
            branch="master"
            branches={branchesMock}
            path=""
            projectId={projectsArrayMock.projects.selectedProject.id}
            updateLastCommit={() => {}}
          />
        </MemoryRouter>,
      )
      .toJSON();

    expect(component).toMatchSnapshot();
  });
});
