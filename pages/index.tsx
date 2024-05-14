import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { DragDropContext, DropResult } from 'react-beautiful-dnd'
import InputField from '../components/inputfield' // Potential error might be here
import Todos from '../components/todos'
import { Status, Todo, TodosView, TodosStatus } from '../models/todo'
import styles from '../styles/Home.module.css'
import { setDoc, doc, addDoc, collection, deleteDoc, query, onSnapshot, QuerySnapshot } from 'firebase/firestore'
import { db } from '../backend/firebase'

const Home: NextPage = () => {
  // State variables for todo management
  const [name, setName] = useState<string>(''); // Name of the new todo
  const [view, setView] = useState<TodosView>(TodosView.KanbanView); // Current view (Kanban or List)
  const [backlogTodos, setBacklogTodos] = useState<Todo[]>([]); // Backlog todos
  const [activeTodos, setActiveTodos] = useState<Todo[]>([]); // Active todos
  const [completedTodos, setCompletedTodos] = useState<Todo[]>([]); // Completed todos

  // Fetches todos from local storage on component mount
  useEffect(() => {
    let backlogTodos = window.localStorage.getItem('backlogTodos')
    if (backlogTodos) {
      let parsed = JSON.parse(backlogTodos)
      setBacklogTodos(parsed)
    }
    let activeTodos = window.localStorage.getItem('activeTodos')
    if (activeTodos) {
      let parsed = JSON.parse(activeTodos)
      setActiveTodos(parsed)
    }
    let completedTodos = window.localStorage.getItem('completedTodos')
    if (completedTodos) {
      let parsed = JSON.parse(completedTodos)
      setCompletedTodos(parsed)
    }
  }, [])

  // Handles adding a new todo
  const addNewTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (name) {
      const newTodo = {
        id: Date.now(),
        todoname: name,
        status: Status.Backlog,
        isDone: false
      }

      setBacklogTodos([...backlogTodos, newTodo])

      try {
        // Add new todo to Firestore
        const docRef = collection(db, 'todos')
        await addDoc(docRef, newTodo)
        setBacklogTodos([...backlogTodos, newTodo]);
        setName('');
      } catch (error) {
        console.error('Error adding document: ', error);
      }
    }
  }

  // Fetches todos from Firestore in real-time
  useEffect(() => {
    const q = query(collection(db, 'todos'))
    const unsubscribe = onSnapshot(q, (QuerySnapshot) => {
      let todosArr: Todo[] = []
      QuerySnapshot.forEach((doc) => {
        todosArr.push({ ...doc.data(), id: doc.id })
      });
      setBacklogTodos(todosArr)
    })
    return () => unsubscribe()
  }, [])

  // Handles drag and drop functionality for todos
  const onDragEndHandler = (result: DropResult) => {
    const { destination, source } = result

    if (!destination || (destination.droppableId === source.droppableId
      && destination.index === source.index)) return

    let add,
      backlog = backlogTodos.slice(), // Create copies to avoid mutation
      active = activeTodos.slice(),
      complete = completedTodos.slice()
    switch (source.droppableId) {
      case TodosStatus.BacklogTodos:
        add = backlogTodos[source.index]
        backlog.splice(source.index, 1)
        break
      case TodosStatus.ActiveTodos:
        add = active[source.index]
        active.splice(source.index, 1)
        break
      case TodosStatus.CompletedTodos:
        add = complete[source.index]
        complete.splice(source.index, 1)
        break
    }

    if (add) {
      switch (destination.droppableId) {
      case TodosStatus.BacklogTodos:
      backlog.splice(destination.index, 0, add)
      break
    case TodosStatus.ActiveTodos:
      active.splice(destination.index, 0, add)
      break
    case TodosStatus.CompletedTodos:
      complete.splice(destination.index, 0, add)
      break
    }

    setBacklogTodos(backlog)
    setActiveTodos(active)
    setCompletedTodos(complete)

    if (window) {
      window.localStorage.setItem('backlogTodos', JSON.stringify(backlog))
      window.localStorage.setItem('activeTodos', JSON.stringify(active))
      window.localStorage.setItem('completedTodos', JSON.stringify(complete))
    }
  }

  // Renders the UI components
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
            <Image src= website logo.png alt="Left Logo" width={50} height={50} /> {/* Adjust width and height as needed */}
      <h2 className="ml-2 text-4xl font-bold">To-do</h2>

            {/* ... header content */}
          </div>
          <div>
      <Image src=O_LOGO.png alt="Right Logo" width={50} height={50} /> {/* Adjust width and height as needed */}
    </div>

        </header>
        <div className="flex flex-col items-center min-h-screen pt-10">

          {/* Input field for adding new todo */}
          <input
            value={name} // Current value of the "name" state variable
            onChange={(e) => {setName(e.target.value)}} // Updates "name" state on input change
            onSubmit={addNewTodo} // Triggers submission logic in "addNewTodo" function (if defined in InputField)
            placeholder="Add a new todo" // Placeholder text for the input field
          />

          {/* You can add more content here */}
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
  )
}

Home.getInitialProps = async ({ }) => {
  console.log('req, ')
  return {}
}

export default Home
