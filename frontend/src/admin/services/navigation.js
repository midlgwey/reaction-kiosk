let navigateFunction;

export const setNavigator = (nav) => {
  navigateFunction = nav;
};

export const navigateTo = (path) => {
  if (navigateFunction) {
    navigateFunction(path);
  }
};
