const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient
const PORT = 2121
require('dotenv').config()

//Create the variables
let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'todo'

    //Connect to MongoDB
MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true })
//once connected, state to the log that you are connected to the database 'todo'
    .then(client => {
        console.log(`Connected to ${dbName} Database`)
        //the database is the 'todo' database
        db = client.db(dbName)
    })
    
//use the ejs file to set the information we're viewing    
app.set('view engine', 'ejs')
//show everything in the 'public' folder
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

//the default response/web page
app.get('/',async (request, response)=>{
    //take all to do items and put them into an array
    const todoItems = await db.collection('todos').find().toArray()
    //the items left are items that are marked as 'completed: false'
    const itemsLeft = await db.collection('todos').countDocuments({completed: false})
    //show both the todo Items and the items left
    response.render('index.ejs', { items: todoItems, left: itemsLeft })
    // db.collection('todos').find().toArray()
    // .then(data => {
    //     db.collection('todos').countDocuments({completed: false})
    //     .then(itemsLeft => {
    //         response.render('index.ejs', { items: data, left: itemsLeft })
    //     })
    // })
    // .catch(error => console.error(error))
})

//use the following information when adding something to the database
app.post('/addTodo', (request, response) => {
    //Add information/data to the the todos database - mark them as completed: false
    db.collection('todos').insertOne({thing: request.body.todoItem, completed: false})
    //Once the new information/data/item is added, redirect to the default site/page
    .then(result => {
        console.log('Todo Added')
        response.redirect('/')
    })
    .catch(error => console.error(error))
})

//update using this url to mark a todo as completed
app.put('/markComplete', (request, response) => {
    //use the database of 'todos' to update one data point
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{
        //set completed to true
        $set: {
            completed: true
          }
    },{
        //sort the newest id first (descending order) if multiple items match the criteria searched for
        sort: {_id: -1},
        //if data that matches the criteria is not found, do not create new data
        upsert: false
    })
    .then(result => {
        //Once the result is finished, show the following in the console and the json response
        console.log('Marked Complete')
        response.json('Marked Complete')
    })
    .catch(error => console.error(error))

})

//update using this url to mark a todo as incomplete
app.put('/markUnComplete', (request, response) => {
    //use the todos database to update one data point
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{
        //mark the todo as completed: false
        $set: {
            completed: false
          }
    },{
        //if multiple ids are found with the same criteria, sort them as descending
        sort: {_id: -1},
        //if data is not found with the criteria searched for, do not add new data
        upsert: false
    })
    .then(result => {
        //Once the result is finished, show the following in the console and the json response
        console.log('Marked Complete')
        response.json('Marked Complete')
    })
    .catch(error => console.error(error))

})

//use the following url to delete a todo item
app.delete('/deleteItem', (request, response) => {
    //use the todos database and delete one data point (what's searched for)
    db.collection('todos').deleteOne({thing: request.body.itemFromJS})
    .then(result => {
        //once the action is completed, show the following in the console and in the json
        console.log('Todo Deleted')
        response.json('Todo Deleted')
    })
    .catch(error => console.error(error))

})

//use the Port of the environment we are using or use the port shown in the code
app.listen(process.env.PORT || PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})