const OpenAI = require("openai")

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})
const express = require("express")
const session = require("express-session")
const bodyParser = require("body-parser")
const fs = require("fs")

const app = express()

app.use(bodyParser.urlencoded({ extended:true }))

app.use(session({
secret:"portal",
resave:false,
saveUninitialized:true
}))

app.use(express.static("views"))

function auth(req,res,next){
if(req.session.user){
next()
}else{
res.redirect("/login")
}
}

app.get("/",(req,res)=>{
res.sendFile(__dirname+"/views/index.html")
})

app.get("/register",(req,res)=>{
res.sendFile(__dirname+"/views/register.html")
})

app.post("/register",(req,res)=>{

let users = JSON.parse(fs.readFileSync("./data/users.json"))

users.push({
user:req.body.user,
pass:req.body.pass
})

fs.writeFileSync("./data/users.json",JSON.stringify(users))

res.redirect("/success")

})

app.get("/success",(req,res)=>{
res.sendFile(__dirname+"/views/success.html")
})

app.get("/login",(req,res)=>{
res.sendFile(__dirname+"/views/login.html")
})

app.post("/login",(req,res)=>{

let users = JSON.parse(fs.readFileSync("./data/users.json"))

let found = users.find(u => u.user === req.body.user && u.pass === req.body.pass)

if(found){
req.session.user = found.user
res.redirect("/dashboard")
}else{
res.send("Wrong login")
}

})

app.get("/dashboard",auth,(req,res)=>{
res.sendFile(__dirname+"/views/dashboard.html")
})

app.listen(3000,()=>{
console.log("Portal running on port 3000")
})

app.post("/ai", async (req,res)=>{

  const question = req.body.question

  const completion = await openai.chat.completions.create({
    model:"gpt-4o-mini",
    messages:[
      {role:"system",content:"You are an AI tutor helping students study."},
      {role:"user",content:question}
    ]
  })

  res.json({
    answer: completion.choices[0].message.content
  })

})

app.get("/admin/users",(req,res)=>{

let users=JSON.parse(fs.readFileSync("./data/users.json"))

res.json(users)

})

app.get("/admin/stats",(req,res)=>{

let users=JSON.parse(fs.readFileSync("./data/users.json"))

res.json({
totalUsers:users.length
})

})

const nodemailer = require("nodemailer")

let transporter = nodemailer.createTransport({
service:"gmail",
auth:{
user:"yourgmail@gmail.com",
pass:"app-password"
}
})

function sendEmail(user){

transporter.sendMail({

from:"portal@site.com",
to:user.email,
subject:"Welcome to AI Learning Platform",
text:"Your account has been created."

})

}
