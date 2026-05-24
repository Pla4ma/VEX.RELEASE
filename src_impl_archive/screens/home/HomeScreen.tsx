/**
 * HomeScreen — uses stage-isolated containers.
 * Each user stage renders a container that only imports/executes hooks for that stage.
 */
import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import { HomeStageResolver } from './containers/HomeStageResolver';

export const HomeScreen = withScreenErrorBoundary(function _HomeScreen(): JSX.Element {
  return <HomeStageResolver />;
}, 'Home');

export default HomeScreen;
