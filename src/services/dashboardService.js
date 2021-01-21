'use strict'

const { NULL } = require('mysql2/lib/constants/types')
const pool = require('../lib/mysql')

class DashboardServices {
  constructor() {}

  getMaleFemaleUsers = async () => {
    let eventById
    let usersArray = []
    let query = `select (select count(id_user_detail) from users_detail where gender = 'Female') as FemaleUsers,
    (select count(id_user_detail) from users_detail where gender = 'Male')  as MaleUsers
    `
    try {
      const users = await pool.query(query)
      if(users.length){
          usersArray.push(users[0]['FemaleUsers'])
          usersArray.push(users[0]['MaleUsers'])
      }
    } catch (err) {
      console.error('Error while getting this list of users', err)
    }
    return usersArray || []
  }

  getUsersByCountry = async () => {
    let eventById
    let usersArray = []
    let query = `SELECT (
        SELECT count(country) FROM users_detail WHERE country = "Colombia") as Colombia,
        (SELECT count(country) FROM users_detail WHERE country = "México") as Mexico,
        (SELECT count(country) FROM users_detail WHERE country = "Chile") as Chile,
        (SELECT count(country) FROM users_detail WHERE country = "Brasil") as Brasil,
        (SELECT count(country) FROM users_detail WHERE country = "Ecuador") as Ecuador,
        (SELECT count(country) FROM users_detail WHERE country = "España") as Espana,
        (SELECT count(country) FROM users_detail WHERE country = "Uruguay") as Uruguay,
        (SELECT count(country) FROM users_detail WHERE country = "Argentina") as Argentina,
        (SELECT count(country) FROM users_detail WHERE country = "Paraguay") as Paraguay,
        (SELECT count(country) FROM users_detail WHERE country = "Perú") as Peru`
    try {
      const users = await pool.query(query)
      if(users.length){
          usersArray.push(users[0]['Colombia'])
          usersArray.push(users[0]['Mexico'])
          usersArray.push(users[0]['Chile'])
          usersArray.push(users[0]['Brasil'])
          usersArray.push(users[0]['Ecuador'])
          usersArray.push(users[0]['Espana'])
          usersArray.push(users[0]['Uruguay'])
          usersArray.push(users[0]['Argentina'])
          usersArray.push(users[0]['Paraguay'])
          usersArray.push(users[0]['Peru'])
        
      }
    } catch (err) {
      console.error('Error while getting this list of users', err)
    }
    return usersArray || []
  }
  
  getUsersActiveInactive = async () => {
    let eventById
    let usersArray = []
    let query = `SELECT
    (SELECT count(status_) FROM users WHERE status_ = "Inactive") as InactiveUsers,
    (SELECT count(status_) FROM users WHERE status_ = "Active") as ActiveUsers`
    try {
      const users = await pool.query(query)
      if(users.length){
          usersArray.push(users[0]['InactiveUsers'])
          usersArray.push(users[0]['ActiveUsers'])
      }
    } catch (err) {
      console.error('Error while getting this list of users', err)
    }
    return usersArray || []
  }
  getEventsStatus = async () => {
    
    let eventsArray = []
    let query = `SELECT
    (SELECT count(status_) FROM events_ WHERE status_ = "Created") as Created,
    (SELECT count(status_) FROM events_ WHERE status_ = "Done") as Done,
    (SELECT count(status_) FROM events_ WHERE status_ = "Published") as Published`
    try {
      const events = await pool.query(query)
      if(events.length){
          eventsArray.push(events[0]['Created'])
          eventsArray.push(events[0]['Done'])
          eventsArray.push(events[0]['Published'])
      }
    } catch (err) {
      console.error('Error while getting this list of events', err)
    }
    return eventsArray || []
  }
  getEventsStatusByOrg = async (organizationId) => {
    
    let eventsArray = []
    let query = `SELECT count(id_organization) as NumberOfEvents FROM events_ 
    WHERE id_organization = ? and status_ not in ('Cancelled', 'Created')`
    try {
      const events = await pool.query(query, organizationId)
      if(events.length){
          eventsArray.push(events[0]['NumberOfEvents'])
      }
    } catch (err) {
      console.error('Error while getting this list of events', err)
    }
    return eventsArray || []
  }
  getEventsByType = async () => {
    
    let eventsArray = []
    let query = `SELECT
    (SELECT count(event_type) FROM events_  WHERE event_type = "Online") as Online,
    (SELECT count(event_type) FROM events_  WHERE event_type = "Presential") as Presential`
    try {
      const events = await pool.query(query)
      if(events.length){
          eventsArray.push(events[0]['Online'])
          eventsArray.push(events[0]['Presential'])
      }
    } catch (err) {
      console.error('Error while getting this list of events', err)
    }
    return eventsArray || []
  }

}


module.exports = DashboardServices
