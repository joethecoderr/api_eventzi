'use strict'

const { NULL } = require('mysql2/lib/constants/types')
const pool = require('../lib/mysql')
const AWS_LOAD = require('../lib/awsLoad')
const AWSLOAD = new AWS_LOAD

class DifusionServices {
  constructor() {}

  getMessage = async (eventId ) => {
    let eventById
    let query = `select * from events_difusion where id_event_ = ? limit 1`
    try {
      eventById = await pool.query(query, eventId)
    } catch (err) {
      console.error('Error while getting this event', err)
    }
    return eventById || []
  }

  createMessage = async ({ eventId, params}) => {
    let queryVerifyNotMessageExistant = `select id_event_difussion from events_difusion where id_event_ = ?`
    let query = `insert into events_difusion set id_event_ = ?, 
    title_ = ?, message = ?`
    try {
      const verify = await pool.query(queryVerifyNotMessageExistant, [eventId])
      if(verify[0] !== undefined){
        return null
      }else{
        let result = await pool.query(query, [
          eventId,
          params.title,
          params.message,
        ])

        return result || {}
      }
    } catch (err) {
      console.error('There was an error registering your event', err)
    }

    return null
  }
  updateMessage = async ({ eventId, params}) => {
    let query = `update events_difusion set
    title_ = ?, message = ? where id_event_ = ?`
    try {
      let result = await pool.query(query, [
        params.title,
        params.message,
        eventId,
      ])

      return result || {}
    } catch (err) {
      console.error('There was an error updating your message', err)
    }

    return null
  }
}


module.exports = DifusionServices
