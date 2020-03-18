import React, { useState } from 'react';
import { store as globalStore, WithStoreProp } from '../../src';
import * as testUtils from '../testUtils';

type Props = WithStoreProp & {
  hiddenMessage: string;
};

type State = {
  showHiddenMessage: boolean;
};

class MyComponent extends React.PureComponent<Props, State> {
  state = {
    showHiddenMessage: false,
  };

  render() {
    const { store } = this.props;

    return (
      <div>
        {this.state.showHiddenMessage && <p>{store.hiddenMessage}</p>}

        <button
          onClick={() => {
            this.setState({ showHiddenMessage: true });
          }}
        >
          Show hidden message
        </button>
      </div>
    );
  }
}

/**
 * This test demonstrates the situation where a store prop isn't read when
 * Recollect renders the component. The component later changes state to then
 * read from the store. But Recollect can't attribute those reads to the
 * component so it isn't subscribed.
 * So, when the store is updated, the component is not.
 */
it('WILL NOT update a component if the props are not used during render', () => {
  const { queryByText, getByText } = testUtils.collectAndRender(MyComponent);

  expect(queryByText('Hidden message')).not.toBeInTheDocument();

  globalStore.hiddenMessage = 'Hidden message';
  getByText('Show hidden message').click();

  expect(queryByText('Hidden message')).toBeInTheDocument();

  globalStore.hiddenMessage = 'A new message!';

  // In a perfect world, the component would have been updated
  expect(queryByText('A new message!')).not.toBeInTheDocument();
});

/**
 * Same test as above, but with hooks
 */
it('WILL NOT update a component if the props are not used during render', () => {
  const { queryByText, getByText } = testUtils.collectAndRender(
    ({ store }: Props) => {
      const [showHiddenMessage, setShowHiddenMessage] = useState(false);

      return (
        <div>
          {showHiddenMessage && <p>{store.hiddenMessage}</p>}

          <button
            onClick={() => {
              setShowHiddenMessage(true);
            }}
          >
            Show hidden message
          </button>
        </div>
      );
    }
  );

  expect(queryByText('Hidden message')).not.toBeInTheDocument();

  globalStore.hiddenMessage = 'Hidden message';
  getByText('Show hidden message').click();

  expect(queryByText('Hidden message')).toBeInTheDocument();

  globalStore.hiddenMessage = 'A new message!';

  // In a perfect world, the component would have been updated
  expect(queryByText('A new message!')).not.toBeInTheDocument();
});

/**
 * Workaround for this issue, as advertised in the readme
 */
it('should update a component with useProps', () => {
  // All this does is ensure that these values are read when the component
  // renders, so Recollect subscribes this component to changes.
  const useProps = (propList: any[]) => propList.includes('');

  const { queryByText, getByText } = testUtils.collectAndRender(
    ({ store }: Props) => {
      const [showHiddenMessage, setShowHiddenMessage] = useState(false);

      useProps([store.hiddenMessage]);

      return (
        <div>
          {showHiddenMessage && <p>{store.hiddenMessage}</p>}

          <button
            onClick={() => {
              setShowHiddenMessage(true);
            }}
          >
            Show hidden message
          </button>
        </div>
      );
    }
  );

  expect(queryByText('Hidden message')).not.toBeInTheDocument();

  globalStore.hiddenMessage = 'Hidden message';
  getByText('Show hidden message').click();

  expect(queryByText('Hidden message')).toBeInTheDocument();

  globalStore.hiddenMessage = 'A new message!';

  expect(queryByText('A new message!')).toBeInTheDocument();
});
