
const pool = require('../lib/mysql')
const AWS_LOAD = require('../lib/awsLoad')
const { Organizations } = require('aws-sdk')
const AWSLOAD = new AWS_LOAD




class PartnersServices {
    constructor() { }

    getPartners = async (eventId) => {
        try {
            const partners = await pool.query(`SELECT p.id_partner, p.name_, p.url, p.logo from partners_events as pe 
            join partners p on p.id_partner = pe.id_partner 
            where pe.id_event_ = ?`, eventId)
            return partners || []
        } catch (error) {
            console.error('An error as ocurred.')
            console.error(error)
        }
    }

    getPartnersByOrg = async (organizationId) => {
        try {
            
            const partners = await pool.query(`select * from partners where id_organization = ?`, organizationId)
            return partners || []
        } catch (error) {
            console.error('An error as ocurred.')
            console.error(error)
        }
    }


    getPartnerDetail = async ({organizationId}) => {
        try {
            
            const orgById = await pool.query('SELECT * FROM organizations WHERE id_organization = ?', organizationId)
            return orgById || {}
        } catch (error) {
            console.error('An error has occurred.')
            console.error(error)
        }
    }

    createPartner = async ({params, eventId, logo}) => {
        let querygetOrganization = `select id_organization from events_ where id_event_ = ?`
        let queryPartner = `insert into partners set id_organization = ?, 
        name_ = ?, url = ?, logo = ?`
        let queryPartnerEvent = `insert into partners_events set id_partner = ?,
        id_event_ = ?`
        let inserted_id;
        let partner;
        let organizationId
        try {
            const organization = await pool.query(querygetOrganization, [eventId])
            organizationId = organization[0]["id_organization"]
        } catch (error) {
            console.error('Eror while getting Id org')
            console.error(error)
        }
        if(organizationId > 0){
            try {
                    partner = await pool.query(queryPartner, [
                    organizationId,
                    params.name_,
                    params.url,
                    AWSLOAD.uploadPhoto( logo, 'partnerLogo')
                ])
                inserted_id = partner.insertId
            } catch (error) {
                console.error('Se ha presentado un error creando la nueva organización.')
                console.error(error)
            }
            if(inserted_id){
                try{
                    const partnerEvent = await pool.query(queryPartnerEvent, [inserted_id, eventId])
                    return partnerEvent || {}

                } catch (error){
                    console.error('Error agregando el partner al evento')
                    console.error(error)
                }

            }
        }
        return {}
    }

    addExistantPartner = async (partnerId, eventId) => {
        const query = `insert into partners_events set id_partner = ?, id_event_ = ?`

        try {
            const partner = await pool.query(query,[partnerId, eventId])
            return partner || {}
        } catch (error) {
            console.error('Se ha presentado un error creando la nueva organización.')
            console.error(error)
        }
      }

    updatePartner = async ({partnerId, params}) => {
        try {
            const updatePartner = await pool.query(`update partners set 
            name_ = ?, url = ? where id_partner = ?`, [
                params.name_,
                params.url, 
                partnerId])
           
            return updatePartner || {}
        } catch (error) {
            console.error('error updating partner')
            console.error(error)
        }
    }

    deletePartner = async (orgId) => {
        try {
            const deleteOrg = await pool.query('UPDTATE organizations set status_=2 WHERE id_organization = ?', [orgId])
            return deleteOrg
        } catch (error) {
            console.error('An error has ocurrred.')
            console.error(error)
        }
        
    }
    updatePartnerLogo = async (partnerId, logo) => {
        try {
            const partner = await pool.query(`update partners set 
            logo = ? where id_partner = ?`, [
                AWSLOAD.uploadPhoto(logo, 'partnerLogo'),
                partnerId
                ])
            return partner || {}
        } catch (error) {
            console.error('Se ha presentado un error creando la nueva organización.')
            console.error(error)
        }
    }
}

module.exports = PartnersServices

