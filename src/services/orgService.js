'use strict'

const { query } = require('../lib/mysql')
const pool = require('../lib/mysql')
const { param } = require('../routes/organizations')
const AWS_LOAD = require('../lib/awsLoad')
const AWSLOAD = new AWS_LOAD

class OrganizationsServices {
    constructor() { }

    getOrganizations = async () => {
        let listOrganization
        try {
             listOrganization = await pool.query('SELECT * FROM organizations')
        } catch (error) {
            console.error('An error as ocurred.')
            console.error(error)
        }
        return listOrganization || []
    }
    getOrganizationByUser = async (userId) => {
        let query = `SELECT *, IF(1, 1,0) as IsAdmin FROM organizations WHERE id_user = ? and status_ = 1
                    UNION 
                    Select o.*, IF(0, 1, 0) as IsAdmin from events_ as e 
                    join users_events ue on e.id_event_ = ue.id_event_ 
                    join organizations o on o.id_organization = e.id_organization 
                    where ue.id_user = ? and o.status_ = 1 and e.status_ in (1,2) 
                    and ue.relationship = 2`
      try {
          const orgByUser = await pool.query(query, [userId, userId])
          return orgByUser || {}
      } catch (error) {
          console.error('An error has occurred.')
          console.error(error)
      }
  }

    getOrganization = async ({organizationId}) => {
        try {
            
            const orgById = await pool.query('SELECT * FROM organizations WHERE id_organization = ?', organizationId)
            return orgById || {}
        } catch (error) {
            console.error('An error has occurred.')
            console.error(error)
        }
    }

    createOrganization = async ({params, userId, logo}) => {
      let inserted_id;
      try {
          const queryLastInsert = `select * from organizations where id_organization = ?`
          const newOrg = await pool.query(`INSERT INTO organizations set id_user = ?, 
          organization_name = ?, status_ = 1, logo = ?, description_ = ?`, [
              userId,
              params.organization_name,
              AWSLOAD.uploadPhoto(logo, 'orgLogo'),
              params.description])
          inserted_id = newOrg.insertId
          const lastInsert = await pool.query(queryLastInsert, inserted_id)
          return lastInsert || {}
      } catch (error) {
          console.error('Se ha presentado un error creando la nueva organización.')
          console.error(error)
      }
    }

    updateOrganization = async ({organizationId, params, logo}) => {
        try {

            const queryLastUpdate = `select * from organizations where id_organization = ?`
            const updateOrg = await pool.query(`update organizations set 
            organization_name = ?, status_ = ? where id_organization = ?`, [
                params.organization_name,
                params.status_,
                organizationId])
            const lastupdate = await pool.query(queryLastUpdate, organizationId)
            return lastupdate || {}
        } catch (error) {
            console.error('An error has ocurred when updating your org info')
            console.error(error)
        }
    }

    deleteOrganization = async (orgId) => {
      console.log('Entre al delete')
        try {
            const deleteOrg = await pool.query('UPDATE organizations set status_=2 WHERE id_organization = ?', [orgId])
            return deleteOrg
        } catch (error) {
            console.error('An error has ocurrred.')
            console.error(error)
        }
    }
    getOrganizers = async ( organizationId ) => {
        let query = `select u.id_user, u.email, ud.full_name from users_organizations as uo
        join users u on u.id_user = uo.id_user 
        join users_detail ud on ud.id_user = uo.id_user where uo.id_organization = ?`
        try {
          const organizers = await pool.query(query, organizationId)
          return organizers || []
        } catch (err) {
          console.error('Error while getting list of organizers', err)
        }
        
      }
      getEventsWithOrganizers = async ( userId ) => {
        let query = `select ue.id_user_event, u.id_user, o.organization_name,o.id_user as userorg, ud.full_name, u.email, e.event_name from users_events as ue
        join users u on u.id_user = ue.id_user
        left join users_detail ud on ud.id_user = ue.id_user
        join events_ e on e.id_event_ = ue.id_event_
        join organizations o on o.id_organization = e.id_organization
        where ue.relationship = ('organizer') and o.id_user = ? and ue.status_ = 1 and e.status_ in (1,2)
        `
      /*  let query = `select u.id_user, ud.full_name, u.email, e.event_name from users_events as ue
        join users u on u.id_user = ue.id_user
        left join users_detail ud on ud.id_user = ue.id_user
        join events_ e on e.id_event_ = ue.id_event_
        where ue.relationship = ('organizer') and e.id_organization = ?` */
        try {
          const organizers = await pool.query(query, userId)
          return organizers || []
        } catch (err) {
          console.error('Error while getting list of events', err)
        }
      }

      getEventsByOrganization = async ( organizationId, userId ) => {

           let query 
           let queryIsAdmin = `select id_user from organizations where id_organization = ? and id_user = ?`
           let isAdmin
        try {
        
          const admin = await pool.query(queryIsAdmin, [organizationId, userId])
          if(admin.length > 0){
            query =  `select o.organization_name, e.*, ed.description_, ed.date_, ed.url , ep.logo, ep.banner, ep.template , IF(1, True, False) as IsAdmin from events_ as e
            left join events_detail ed on ed.id_event_ = e.id_event_
            left join events_post ep on ep.id_event_ = e.id_event_
            join organizations o on o.id_organization = e.id_organization
            where e.id_organization = ?  and  e.status_ in (1, 2) `
          }
          else {
            query =` select o.organization_name, e.*, ed.description_, ed.date_, ed.url , ep.logo, ep.banner, ep.template , IF(0, True, False) as IsAdmin from events_ as e
            left join events_detail ed on ed.id_event_ = e.id_event_
            left join events_post ep on ep.id_event_ = e.id_event_
            join users_events ue on ue.id_event_ = e.id_event_ 
            join organizations o on o.id_organization = e.id_organization
            where e.id_organization = ? and  ue.id_user = ? and ue.relationship = 2  and e.status_ in (1, 2)`
          }
          
        } catch (err) {
          console.error('Error while getting list of events', err)
          }
        try {
          
          const organizers = await pool.query(query, [organizationId, userId, organizationId])
          return organizers || []
        } catch (err) {
          console.error('Error while getting list of events', err)
        }
      }


}

module.exports = OrganizationsServices
