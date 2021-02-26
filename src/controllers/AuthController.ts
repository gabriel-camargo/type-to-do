import {
    Request,
    Response
} from "express";
import * as jwt from "jsonwebtoken";
import { mongoError } from "./../modules/common/service";
import { IUser } from "./../modules/users/model";
import UserService from "./../modules/users/service";

class AuthController {
    static signIn = async (req: Request, res: Response) => {
        let { email,  password } = req.body;
        
        if (!(email && password)) {
            res.status(400).send();
        }

        const userFilter = { email };

        try {
            
            const user = await UserService.find(userFilter);

            if(!UserService.isPasswordValid(password, user.password)) {
                res.status(401).send();
            }

            const token = jwt.sign(
                {
                    userId: user._id,
                    username: user.email
                },
                process.env.SECRET ?? '', {
                    expiresIn: "1h"
                }
            );

            res.status(200).send({token});
                           
        } catch (error) {
            console.log('error', error.message)
            res.status(400).send({
                error: true,
                message: error.message ?? 'Erro'
            })
        }
    };

    static signUp = async (req: Request, res: Response) => {
        const userParams: IUser = {
            name: {
                first_name: req.body.name.first_name,
                middle_name: req.body.name.middle_name,
                last_name: req.body.name.last_name
            },
            email: req.body.email,
            password: req.body.password,
            modification_notes: [{
                modified_on: new Date(Date.now()),
                modification_note: 'New user created'
            }]
        };

        userParams.password = UserService.hashPassword(userParams.password)

        try {
            const data = await UserService.create(userParams)
            res.status(201).send({ message: 'User created!', data})
        } catch (error) {
            console.log('error', error)
            res.status(500).send({
                'error': true,
                'message': 'error'
            })
        }
    };

    static dashboard(req: Request, res: Response) {
        res.status(200).send({ 'message': 'welcome@'})
    }
}
export default AuthController;