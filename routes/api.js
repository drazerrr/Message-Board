'use strict';

const { Board } = require('../models');

const ThreadModel = require('../models').Thread;
const BoardModel = require('../models').Board;
const ReplyModel = require('../models').Reply;

module.exports = function (app) {
  
  app.route('/api/threads/:board')
  .post(async (req, res) => {
    const {text, delete_password} = req.body
    let board = req.body.board;
    if(!board) {
       board = req.params.board
    }

    const newThread = new ThreadModel({
      text: text,
      delete_password: delete_password,
      replies: []
    });

     let BoardData = await BoardModel.findOne({name: board})
      if(!BoardData) {
        const newBoard = new BoardModel({
          name: board,
          thread: []
        });
        newBoard.threads.push(newThread);
         let data = await newBoard.save();
          if(!data){
            res.send("There was an error saving in post")
          } else {
          res.json(newThread)
          }
          
      } else {
        BoardData.threads.push(newThread);
        let data = await BoardData.save();
          if(!data){
            res.send("There was an error saving in post")
          } else {
          res.json(newThread)
          }
      }
  })
  .get(async (req, res) => {
    const board = req.params.board;
    let BoardData = await BoardModel.findOne({name: board}, {"threads": -1});
    if(!BoardData) {
      res.json({error: "No board with this name"})
    } else {
      let threads = BoardData.threads.map((thread) => {
        const {
          _id,
          text,
          created_on,
          bumped_on,
          replies,
        } = thread;
        return {
          _id,
          text,
          created_on,
          bumped_on,
          replies,
          replyCount: thread.replies.length,
        };
      });
      res.json(threads)
    }
  })
  .put(async (req, res) => {
    const {thread_id} = req.body;
    console.log(thread_id)
    const board = req.params.board

    let BoardData = await BoardModel.findOne({name: board});
    if(!BoardData) {
      res.json("error", "Board not found")
    } else {
      let reportThread = BoardData.threads.id(thread_id);
      if(reportThread){
        reportThread.reported = true;
      reportThread.bumped_on = new Date();
      let data = await BoardData.save();
      if(!data) {
        res.json("error", "something went wrong")
      }else {
        res.send("reported")
      }
      } else {
        res.send("Thread not found")
      }
      
    }
  })
  .delete((req, res) => {
    console.log(req.body);
  })
    
  app.route('/api/replies/:board');

};
