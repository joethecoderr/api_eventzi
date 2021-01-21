'use strict'

const { NULL } = require('mysql2/lib/constants/types')
const pool = require('../lib/mysql')
const bcrypt = require('bcrypt');
const { param } = require('../routes/users');
const { query } = require('../lib/mysql');
const AWS_LOAD = require('../lib/awsLoad')
const AWSLOAD = new AWS_LOAD



class UserServices {
    constructor() { }
   
    getUsers = async () => {
        let query = `SELECT u.id_user, u.email, ud.full_name, u.status_ FROM users as u 
        join users_detail ud on ud.id_user = u.id_user where u.status_ = 1`
        try {
            const listUser = await pool.query(query)
            return listUser || []
        } catch (error) {
            console.error('Se ha presentado un error cargando la información de los usuarios.')
            console.error(error)
        }
    }
    getUser = async ({userId}) => {
        try {
            const userById = await pool.query(`SELECT u.email, u.status_, ud.full_name,
            ud.gender, ud.country FROM users as u 
            left join users_detail ud on u.id_user = ud.id_user WHERE u.id_user = ?`, userId)
            return userById || {}
        } catch (error) {
            console.error('Se ha presentado un error cargando la información del usuario.')
            console.error(error)
        }
    }

    validateUser = async ({params}) => {
        let userId;
        try {
            userId = await pool.query(`select id_user, email from users 
            where email = ? and psswd = sha2(?, 256) and status_ = 1`, [
                params.email,
                params.psswd])
            return userId || {} 
        } catch (error) {
            console.error('Se ha presentado un error cargando la información del usuario.')
            console.error(error)
        }
    }

    verifyEmailNotRegistered = async (email) =>{
        try {
            let result = await pool.query(`select id_user  from users where email = ?`, email)
            if(result.length){
                return true 
            }
            else{
                return false
            }
        } catch (error){
            console.error(error)
        }
    }

    createUser = async ({params, photoe}) => {
        let query = `insert into users set email = ?, 
        psswd = sha2(?, 256), status_ = 1`

        let queryDetails = `insert into users_detail set id_user = ?, 
        full_name = ?, birthday = ?, gender = ?, country = ?`

        let queryLastInsert = `select u.id_user, u.email, u.status_, u.photo, 
            ud.id_user_detail, ud.full_name, ud.birthday, ud.gender from users as u 
        join users_detail ud on ud.id_user = u.id_user where u.id_user = ?`
        let inserted_id
        let exists = await this.verifyEmailNotRegistered(params.email)
            if(!exists){
                try {
                    let result = await pool.query(query, [
                        params.email,
                        params.psswd,
                ])

                    inserted_id = result.insertId
                } catch (err) {
                    console.error('There was an error registering your event', err)
                    return []
                }
            if (inserted_id) {
                    try {
                        await pool.query(queryDetails, [
                        inserted_id,
                        params.full_name,
                        params.birthday,
                        params.gender,
                        params.country
                        ])
                        const result = await  pool.query(queryLastInsert, inserted_id)
                        return result || []
                    } catch (err) {
                        console.error('Error while when inserting to DB', err)
                    }
            }
            return []
        }
        else{
            return ["Email previously registered"]
        }
    }
    updateAvatar = async (userId, photo) => {
        let query = `update users set photo = ? where id_user = ?`
        try {
            let result = await pool.query(query, [
                AWSLOAD.uploadPhoto(photo, 'userAvatar'),
                userId,    ])
                return result
        } catch (err) {
            console.error('There was en error updating your avatar', err)
        }
    }
    updateUser = async ({userId, params}) => {
        let queryDetails = `UPDATE users_detail set full_name = ?,
        birthday = ?, gender = ?, country = ? where id_user = ?`
        let queryLastUpdate = `select u.id_user, u.email, u.status_, u.photo, 
        ud.id_user_detail, ud.full_name, ud.birthday, ud.gender from users as u 
        join users_detail ud on ud.id_user = u.id_user where u.id_user = ?`
        try {
            const updateUserDetail = await pool.query(queryDetails, [
                params.full_name,
                params.birthday,
                params.gender,
                params.country,
                userId
            ])
        }
        catch(err){
            console.error('Error while updating records', err)
        }
    
    const result = await pool.query(queryLastUpdate, userId)
    return result || []
    }

    updatePassword = async ({userId, params}) => {
        let queryDetails = `UPDATE users set psswd = sha2(?, 256) where id_user = ?`
        try {
            const updatePassword = await pool.query(queryDetails, [
                params.psswd,
                userId
            ])
            return updatePassword
        }
        catch(err){
            console.error('Error while updating records', err)
        }
    }



    deleteUser = async ({userId}) => {
        try {
            const deleteUser = await pool.query('UPDATE users set status_=2 WHERE id_user = ?', userId)
            return deleteUser
        } catch (error) {
            console.error('An error has occurred.')
            console.error(error)
        }
    }
}

module.exports = UserServices
