import { useContext } from 'react';
import styled, { useTheme } from 'styled-components';
import { MetamaskActions, MetaMaskContext } from '../hooks';
import {
  connectSnap,
  getThemePreference,
  getSnap,
  Networks,
  switchChain,
  addChain,
  Chains,
} from '../utils';
import { HeaderButtons } from './Buttons';
import { SnapLogo } from './SnapLogo';
import { Toggle } from './Toggle';

const HeaderWrapper = styled.header`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 2.4rem;
  border-bottom: 1px solid ${(props) => props.theme.colors.border.default};
`;

const Title = styled.p`
  font-size: ${(props) => props.theme.fontSizes.title};
  font-weight: bold;
  margin: 0;
  margin-left: 1.2rem;
  ${({ theme }) => theme.mediaQueries.small} {
    display: none;
  }
`;

const LogoWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const RightContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const ChainWrapper = styled.div`
  margin-right: 20px;
`;

export const Header = () => {
  const theme = useTheme();
  const [state, dispatch] = useContext(MetaMaskContext);

  const handleToggleClick = async () => {
    const chainId =
      state.chainId === Chains.ETH_GOERLI
        ? Chains.POLYGON_MUMBAI
        : Chains.ETH_GOERLI;

    try {
      await switchChain(chainId);
      return true;
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await addChain(chainId);
        } catch (addError) {
          // handle "add" error
          return false;
        }
      }
      // handle other "switch" errors
      return false;
    }
  };

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

  return (
    <HeaderWrapper>
      <LogoWrapper>
        {/* <SnapLogo color={theme.colors.icon.default} size={36} /> */}
        <Title>Alchemy Simulation - Examples</Title>
      </LogoWrapper>
      <RightContainer>
        <ChainWrapper>
          {Networks[state.chainId] && Networks[state.chainId].name}
        </ChainWrapper>
        <Toggle
          onToggle={handleToggleClick}
          // defaultChecked={getThemePreference()}
        />
        <HeaderButtons state={state} onConnectClick={handleConnectClick} />
      </RightContainer>
    </HeaderWrapper>
  );
};
