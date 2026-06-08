/* eslint-env jest */
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: {
      View,
      createAnimatedComponent: component => component,
    },
    useSharedValue: value => ({ value }),
    useAnimatedProps: () => ({}),
    withTiming: value => value,
    Easing: { linear: () => 0 },
  };
});

jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    GestureHandlerRootView: View,
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    PanGestureHandler: View,
    TapGestureHandler: View,
    FlatList: require('react-native').FlatList,
  };
});

jest.mock('@react-native-firebase/app', () => () => ({ apps: [] }));
jest.mock('@react-native-firebase/auth', () => () => ({
  onAuthStateChanged: jest.fn(cb => {
    cb(null);
    return jest.fn();
  }),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  signOut: jest.fn(),
  currentUser: null,
}));
jest.mock('@react-native-firebase/database', () => () => ({
  ref: jest.fn(() => ({
    set: jest.fn(),
    update: jest.fn(),
    once: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
  })),
}));
jest.mock('@react-native-firebase/functions', () => () => ({
  httpsCallable: jest.fn(),
}));
jest.mock('@op-engineering/op-sqlite', () => ({
  open: () => ({
    execute: jest.fn().mockResolvedValue({ rows: [] }),
  }),
}));
