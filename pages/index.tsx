import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import image from 'O_LOGO.png'
import image from 'website_logo.png'
import { useEffect, useState } from 'react'
import { DragDropContext, DropResult } from 'react-beautiful-dnd'
import InputField from '../components/inputfield'
import Todos from '../components/todos'
import { Status, Todo, TodosView, TodosStatus } from '../models/todo'
import styles from '../styles/Home.module.css'
import { setDoc, doc, addDoc, collection, deleteDoc, query, onSnapshot, QuerySnapshot } from 'firebase/firestore'
import { db } from '../backend/firebase'

const Home: NextPage = () => {
  const [name, setName] = useState<string>('')
  const [view, setView] = useState<TodosView>(TodosView.KanbanView)
  const [backlogTodos, setBacklogTodos] = useState<Todo[]>([])
  const [activeTodos, setActiveTodos] = useState<Todo[]>([])
  const [completedTodos, setCompletedTodos] = useState<Todo[]>([])

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

  useEffect(() => {
    const q = query(collection(db, 'todos'))
    const unsubscribe = onSnapshot(q, (QuerySnapshot) => {
      let todosArr: any = []
      QuerySnapshot.forEach((doc) => {
        todosArr.push({ ...doc.data(), id: doc.id })
      });
      setBacklogTodos(todosArr)
    })
    return () => unsubscribe()
  }, [])

  const onDragEndHandler = (result: DropResult) => {
    const { destination, source } = result

    if (!destination || (destination.droppableId === source.droppableId
      && destination.index === source.index)) return

    let add,
      backlog = backlogTodos,
      active = activeTodos,
      complete = completedTodos
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
