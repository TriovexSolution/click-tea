import { registerRootComponent } from 'expo';
import 'react-native-reanimated';
// import { LogBox } from "react-native";
// LogBox.ignoreLogs([
//   "Codegen didn't run for", // suppress those warnings
// ]);
import App from './App';

registerRootComponent(App);
