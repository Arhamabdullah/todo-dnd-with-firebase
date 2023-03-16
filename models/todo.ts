
export interface Todo {
  id: number
  todoname: string
  status: Status
  isDone: boolean
}

export enum Status {
  Backlog,
  Active,
  Done
}


export enum TodosStatus {
  BacklogTodos = 'BacklogTodos',
  ActiveTodos = 'ActiveTodos',
  CompletedTodos = 'CompletedTodos'
}

export enum TodosView {
  KanbanView = 'KanbanView',
  WeeklyView = 'WeeklyView'
}
