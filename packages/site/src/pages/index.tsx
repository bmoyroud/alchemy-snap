import { useContext } from 'react';
import styled from 'styled-components';
import { MetamaskActions, MetaMaskContext } from '../hooks';
import {
  approveUSDC,
  connectSnap,
  getSnap,
  shouldDisplayReconnectButton,
  transferUSDC,
  unwrap,
  wrap,
  swapNative,
  swapUSDC,
} from '../utils';
import {
  ConnectButton,
  InstallFlaskButton,
  ReconnectButton,
  SendHelloButton,
  Card,
  SendTransactionButton,
} from '../components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  margin-top: 7.6rem;
  margin-bottom: 7.6rem;
  ${({ theme }) => theme.mediaQueries.small} {
    padding-left: 2.4rem;
    padding-right: 2.4rem;
    margin-top: 2rem;
    margin-bottom: 2rem;
    width: auto;
  }
`;

const Heading = styled.h1`
  margin-top: 0;
  margin-bottom: 2.4rem;
  text-align: center;
`;

const Span = styled.span`
  color: ${(props) => props.theme.colors.primary.default};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.large};
  font-weight: 500;
  margin-top: 0;
  margin-bottom: 0;
  ${({ theme }) => theme.mediaQueries.small} {
    font-size: ${({ theme }) => theme.fontSizes.text};
  }
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 64.8rem;
  width: 100%;
  height: 100%;
  margin-top: 1.5rem;
`;

const Notice = styled.div`
  background-color: ${({ theme }) => theme.colors.background.alternative};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  color: ${({ theme }) => theme.colors.text.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;

  & > * {
    margin: 0;
  }
  ${({ theme }) => theme.mediaQueries.small} {
    margin-top: 1.2rem;
    padding: 1.6rem;
  }
`;

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.error.muted};
  border: 1px solid ${({ theme }) => theme.colors.error.default};
  color: ${({ theme }) => theme.colors.error.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-bottom: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;
  ${({ theme }) => theme.mediaQueries.small} {
    padding: 1.6rem;
    margin-bottom: 1.2rem;
    margin-top: 1.2rem;
    max-width: 100%;
  }
`;

const Index = () => {
  const [state, dispatch] = useContext(MetaMaskContext);

  const symbol = state.chainId === '0x13881' ? 'MATIC' : 'ETH';

  const handleConnectClick = async () => {
    try {
      await connectSnap();
      const installedSnap = await getSnap();

      dispatch({
        type: MetamaskActions.SetInstalled,
        payload: installedSnap,
      });
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleERC20ApproveClick = async () => {
    try {
      await approveUSDC();
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleERC20TransferClick = async () => {
    try {
      // check if user has USDC before by calling balanceOf on smart contract
      await transferUSDC();
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleWETHDepositClick = async () => {
    try {
      await wrap();
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleWETHWithdrawClick = async () => {
    try {
      await unwrap();
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleSwapNativeClick = async () => {
    try {
      await swapNative();
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleSwapUSDCClick = async () => {
    try {
      await swapUSDC();
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  return (
    <Container>
      {/* <Heading>
        Welcome to <Span>template-snap</Span>
      </Heading> */}
      {state.installedSnap && (
        <Subtitle>
          Examples - Ethereum Goerli and Polygon Mumbai. <br />
          <br />
          Simulation{' '}
          <a
            href="https://docs.alchemy.com/reference/simulation"
            target="_blank"
          >
            available
          </a>{' '}
          for Ethereum, Polygon and Arbitrum.
        </Subtitle>
      )}
      <CardContainer>
        {state.error && (
          <ErrorMessage>
            <b>An error happened:</b> {state.error.message}
          </ErrorMessage>
        )}
        {!state.isFlask ? (
          <Card
            content={{
              title: 'Install',
              description:
                'Snaps is pre-release software only available in MetaMask Flask, a canary distribution for developers with access to upcoming features.',
              button: <InstallFlaskButton />,
            }}
            fullWidth
          />
        ) : (
          <>
            {!state.installedSnap && (
              <Card
                content={{
                  title: 'Connect',
                  description:
                    'Get started by connecting to and installing the Alchemy snap. Adds an additional tab to MetaMask called Alchemy Insights to show you the results of simulation.',
                  button: (
                    <ConnectButton
                      onClick={handleConnectClick}
                      disabled={!state.isFlask}
                    />
                  ),
                }}
                fullWidth
                disabled={!state.isFlask}
              />
            )}

            {shouldDisplayReconnectButton(state.installedSnap) && (
              <Card
                content={{
                  title: 'Reconnect',
                  description:
                    'While connected to a local running snap this button will always be displayed in order to update the snap if a change is made.',
                  button: (
                    <ReconnectButton
                      onClick={handleConnectClick}
                      disabled={!state.installedSnap}
                    />
                  ),
                }}
                disabled={!state.installedSnap}
                fullWidth
              />
            )}

            {/* <Card
              content={{
                title: 'ERC20 - Approve (WIP)',
                description:
                  'Allow the Uniswap Protocol to use your USDC. Gives the Uniswap V3 smart contract permission to use your USDC.',
                button: (
                  <SendTransactionButton
                    onClick={handleERC20ApproveClick}
                    disabled={!state.installedSnap}
                  />
                ),
              }}
              disabled={!state.installedSnap}
              fullWidth
            /> */}

            <Card
              content={{
                title: 'ERC20 - Transfer',
                description: 'Transfer 1 USDC to demo.eth.',
                button: (
                  <SendTransactionButton
                    onClick={handleERC20TransferClick}
                    disabled={!state.installedSnap}
                  />
                ),
              }}
              disabled={!state.installedSnap}
              fullWidth
            />
            <Card
              content={{
                title: `W${symbol} - Deposit`,
                description: `Wrap 1 ${symbol}.`,
                button: (
                  <SendTransactionButton
                    onClick={handleWETHDepositClick}
                    disabled={!state.installedSnap}
                  />
                ),
              }}
              disabled={!state.installedSnap}
            />
            <Card
              content={{
                title: `W${symbol} - Withdraw`,
                description: `Unwrap 1 ${symbol}.`,
                button: (
                  <SendTransactionButton
                    onClick={handleWETHWithdrawClick}
                    disabled={!state.installedSnap}
                  />
                ),
              }}
              disabled={!state.installedSnap}
            />
            <Card
              content={{
                title: `Uniswap V3 - Swap ${symbol}`,
                description: `Swap 1 ${symbol} for USDC.`,
                button: (
                  <SendTransactionButton
                    onClick={handleSwapNativeClick}
                    disabled={!state.installedSnap}
                  />
                ),
              }}
              disabled={!state.installedSnap}
              fullWidth={state.chainId !== '0x5'}
            />
            {state.chainId === '0x5' && (
              <Card
                content={{
                  title: 'Uniswap V3 - Swap USDC',
                  description: 'Swap 1 USDC for UNI.',
                  button: (
                    <SendTransactionButton
                      onClick={handleSwapUSDCClick}
                      disabled={!state.installedSnap}
                    />
                  ),
                }}
                disabled={!state.installedSnap}
                fullWidth={state.chainId !== '0x5'}
              />
            )}
          </>
        )}

        <Notice>
          <p>
            Please note that the <b>snap.manifest.json</b> and{' '}
            <b>package.json</b> must be located in the server root directory and
            the bundle must be hosted at the location specified by the location
            field.
          </p>
        </Notice>
      </CardContainer>
    </Container>
  );
};

export default Index;
