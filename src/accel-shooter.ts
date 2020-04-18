async () => {
  const action = process.argv[2];
  switch (action) {
    case 'config':
    case 'start':
    default:
      throw Error(`Action {action} is not supported`);
  }
};
