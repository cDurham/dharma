type MockFunction = jest.Mock<any, any>;

interface SelectChain {
  from: MockFunction;
  where: MockFunction;
}

interface UpdateChain {
  set: MockFunction;
  where: MockFunction;
}

interface DeleteChain {
  where: MockFunction;
}

interface InsertChain {
  values: MockFunction;
}

export interface MockDb {
  insert: MockFunction;
  select: MockFunction;
  update: MockFunction;
  delete: MockFunction;
  __select: SelectChain;
  __update: UpdateChain;
  __delete: DeleteChain;
  __insert: InsertChain;
}

export const createMockDb = (): MockDb => {
  const selectWhere = jest.fn();
  const selectFrom = jest.fn().mockReturnValue({ where: selectWhere });
  const select = jest.fn().mockReturnValue({ from: selectFrom });

  const updateWhere = jest.fn();
  const updateSet = jest.fn().mockReturnValue({ where: updateWhere });
  const update = jest.fn().mockReturnValue({ set: updateSet });

  const deleteWhere = jest.fn();
  const deleteFn = jest.fn().mockReturnValue({ where: deleteWhere });

  const insertValues = jest.fn();
  const insert = jest.fn().mockReturnValue({ values: insertValues });

  const mock: MockDb = {
    insert: insert,
    select: select,
    update: update,
    delete: deleteFn,
    __select: { from: selectFrom, where: selectWhere },
    __update: { set: updateSet, where: updateWhere },
    __delete: { where: deleteWhere },
    __insert: { values: insertValues },
  };

  return mock;
};
