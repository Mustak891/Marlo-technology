import User from "../modules/UserSchema.js";
import express from 'express';
import bcrypt from 'bcrypt';
import auth from "./authentication.js";

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const firstname = req.body.firstname;
        const lastname = req.body.lastname;
        const email = req.body.email;
        const phone = req.body.phone;
        const company = req.body.company;
        const password = req.body.password;

        if (!firstname || !email || !lastname || !password || !phone || !company) {
            return res.status(400).send("Please enter all fields");
        }

        const isuserexists = await User.findOne({ firstname: firstname });
        const isemailexists = await User.findOne({ email: email });

        if (isuserexists || isemailexists) {
            return res.status(400).send("User already exists please login");
        }

        const createdUser = new User({
            firstname: firstname,
            lastname: lastname,
            email: email,
            phone: phone,
            company: company,
            password: password,
        });

        await createdUser.save();

        res.status(201).send("User created successfully");

    } catch (err) {
        console.log(err);
    }
});

//login user 
router.post('/login', async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        //find if user exists
        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(400).send("User does not exist");
        }

        if (user) {
            const isMatch = await bcrypt.compare(password, user.password);

            if (isMatch) {
                //generate auth token if user is found
                const token = await user.generateAuthToken();
                res.cookie("token", token, {
                    expires: new Date(Date.now() + 8600000),
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
                });
                console.log(token)
                res.status(200).send("User logged in successfully");
            } else {
                res.status(400).send("Invalid credentials");
            }
        } else {
            res.status(400).send("Invalid credentials");
        }
    } catch (err) {
        res.status(400).send(err);
    }
})

//user logout
router.get('/logout', async (req, res) => {
    res.clearCookie('token', { path: '/', httpOnly: true, secure: true, sameSite: "none" });
    res.status(200).send("User logged out successfully");
})


//Authenticate user
router.get('/auth', auth, async (req, res) => {

})

//getUserById
router.get('/getuser/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const employee = await User.findById(id);
        res.status(200).send(employee);
    }
    catch (err) {
        console.log(err);
    }
}
)

//update User
router.put('/updatuser/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findByIdAndUpdate(id);
        user.firstname = req.body.firstname;
        user.lastname = req.body.lastname;
        user.email = req.body.email;
        user.phone = req.body.phone;
        user.company = req.body.company;
        user.password = req.body.password;

        await user.save();
        res.status(200).send("employee updated successfully");
    }
    catch (err) {
        console.log(err);
    }
}
)

//delete employee
router.delete('/deleteuser/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findByIdAndRemove(id);
        await user.remove();
        res.status(200).send("employee deleted successfully");
    }
    catch (err) {
        console.log(err);
    }
}
)


export const usersRouter = router;