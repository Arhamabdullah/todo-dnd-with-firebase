import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import InputField from '../components/inputfield';
import Todos from '../components/todos';
import { Status, Todo, TodosView, TodosStatus } from '../models/todo';
import styles from '../styles/Home.module.css';
import { collection, query, onSnapshot, QuerySnapshot } from 'firebase/firestore';
import { db } from '../backend/firebase';

const Home: NextPage = () => {
  const [name, setName] = useState<string>('');
  const [view, setView] = useState<TodosView>(TodosView.KanbanView);
  const [backlogTodos, setBacklogTodos] = useState<Todo[]>([]);
  const [activeTodos, setActiveTodos] = useState<Todo[]>([]);
  const [completedTodos, setCompletedTodos] = useState<Todo[]>([]);

  useEffect(() => {
    const fetchTodos = async () => {
      const q = query(collection(db, 'todos'));
      const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot) => {
        const todosArr: Todo[] = [];
        snapshot.forEach((doc) => {
          const todoData = doc.data() as Todo; // Ensure that 'Todo' type matches the structure of your Firestore document
          todosArr.push({ ...todoData, id: doc.id });
        });
        setBacklogTodos(todosArr);
      });
      return () => unsubscribe();
    };
    fetchTodos();
  }, []);

  const addNewTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name) {
      const newTodo: Todo = {
        id: Date.now().toString(),
        todoname: name,
        status: Status.Backlog,
        isDone: false,
      };
      try {
        const docRef = collection(db, 'todos');
        await addDoc(docRef, newTodo);
        setBacklogTodos([...backlogTodos, newTodo]);
        setName('');
      } catch (error) {
        console.error('Error adding document: ', error);
      }
    }
  };

  const onDragEndHandler = (result: DropResult) => {
    const { destination, source } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;
    const moveTodo = (sourceId: TodosStatus, destId: TodosStatus) => {
      const sourceTodos = sourceId === TodosStatus.BacklogTodos ? backlogTodos : sourceId === TodosStatus.ActiveTodos ? activeTodos : completedTodos;
      const destTodos = destId === TodosStatus.BacklogTodos ? backlogTodos : destId === TodosStatus.ActiveTodos ? activeTodos : completedTodos;
      const [removed] = sourceTodos.splice(source.index, 1);
      destTodos.splice(destination.index, 0, removed);
      setBacklogTodos([...backlogTodos]);
      setActiveTodos([...activeTodos]);
      setCompletedTodos([...completedTodos]);
    };
    switch (source.droppableId) {
      case TodosStatus.BacklogTodos:
        moveTodo(TodosStatus.BacklogTodos, destination.droppableId as TodosStatus);
        break;
      case TodosStatus.ActiveTodos:
        moveTodo(TodosStatus.ActiveTodos, destination.droppableId as TodosStatus);
        break;
      case TodosStatus.CompletedTodos:
        moveTodo(TodosStatus.CompletedTodos, destination.droppableId as TodosStatus);
        break;
    }
};

  return (
    <DragDropContext onDragEnd={onDragEndHandler}>
      <div className={styles.container}>
        <Head>
          <title>Dr.Tail Work Progress</title>
          <meta name="description" content="Generated by create next app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <header className="flex justify-between items-center px-4 py-2">
          <div className="flex items-center">
            <Image src="/website_logo.png" alt="Left Logo" width={50} height={50} />
            <h2 className="ml-2 text-4xl font-bold">To-do</h2>
          </div>
          <div>
            <Image src="/O_LOGO.png" alt="Right Logo" width={50} height={50} />
          </div>
        </header>
        <div className="flex flex-col items-center min-h-screen pt-10">
          <InputField
            value={name}
            onChange={(e) => setName(e.target.value)}
            onSubmit={addNewTodo}
            placeholder="Add a new todo"
          />
          {/* Additional content goes here */}
        </div>
        <Todos
          view={view}
          backlogTodos={backlogTodos}
          setBacklogTodos={setBacklogTodos}
          activeTodos={activeTodos}
          setActiveTodos={setActiveTodos}
          completedTodos={completedTodos}
          setCompletedTodos={setCompletedTodos}
        />
      </div>
    </DragDropContext>
  );
};

export default Home;
