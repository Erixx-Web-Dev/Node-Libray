const {LoanClass} = require('../class/LoanClass');
const { sendEmailLoanNotif } = require('../helper/Mailer');
const moment = require('moment');
const { mongo } = require('mongoose');
const {UserClass} = require('../class/UserClass');
const { BookClass } = require('../class/BookClass');

const RegisterBookBorrowed = async (req, res) => {
    try {
        let {user, book, due_date} = req.body;
        user = user._id;
        book = book._id;

        let userBorrower = await UserClass.userFindById(user);
        // check if have current borrewed same book

        if(userBorrower && userBorrower.warning >= 3) {
            return res.status(400).json({message: 'This User Has many warning. for the mean time this user are not allowed borrowed'});
        }

        let responseLoan = await LoanClass.loanCreate({user, book, due_date});
        let bookResponse = await BookClass.bookBorrowed(book);
        if(bookResponse.copies == 0) {
            bookResponse = await BookClass.bookUpdateStatus(book, 'unavailable')
        }
        if(responseLoan && bookResponse) {
            return res.status(200).json({message: 'Create Borrowed Book Success', loan: responseLoan });
        }
        return res.status(400).json({message: 'Create Borrowed Book Failed'});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Create Borrowed Book Failed. Server Error.', error_details:{...error}});
    }
}

const LoansList = async(req, res) => {
    try {
        let pageNumber = parseInt(req?.query?.page) || 1;
        const searchInput = {
            book: req?.query?.book || '',
            user: req?.query?.user || '',
            issue_date: req?.query?.issue_date || '',
            due_date: req?.query?.due_date || '',
            return_date: req?.query?.return_date || '',
            status: req?.query?.status ? req?.query?.status == 'all' ? '' : req.query.status : ''
        }
        let limit = 2;
        let response = await LoanClass.loans(pageNumber, limit, searchInput);
        return res.status(200).json({message: 'Loan List Request Success', loans: response });
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Loan List Request Failed. Server Error.', error_details:{...error}});
    }
} 

const SendEmailNotifLoanReturn = async (req, res) => {
    try {
        const {id_loan} = req.params;
        let loan = await LoanClass.loanFind(id_loan);
        if(!loan) {
            return res.status(400).json({message: 'Cannot Find Data. Cannot Send Email Notification'});
        }
        const {user, book, ...loandata} = loan;
        const date = {
            returndate: loan?.return_date ? moment(loan.return_date).format('MMMM Do YYYY, h:mm:ss a') : 'null',
            duedate:  moment(loan.due_date).format('MMMM Do YYYY, h:mm:ss a'),
            issuedate: moment(loan.issue_date).format('MMMM Do YYYY, h:mm:ss a')
        }
        
        let response = await sendEmailLoanNotif(user.email, 'librarysystem@gmail.com', "Return Book's Notification", user, book, date);
        if(!response) {
            return res.status(400).json({message: 'Cannot Send Email Notification. Email Server Error'});
        }
        return res.status(200).json({message: 'Email Send Success'});
    } catch (error) {
       
        return res.status(500).json({message: 'Create Borrowed Book Failed. Server Error.', error_details:{...error}});
    }
}

const LoansFindId = async(req, res) => {
    try {
        const {id_loan} = req.params;
        let response = await LoanClass.loanFind(id_loan);
        const {role, _id} = req.user;
        let isUser = role.find(({name}) => name === 'User');
        if(isUser) {
            if(response.user._id.equals(_id)) {
                return res.status(200).json({message: 'Loan Details Request Success', loan: response }); 
            }
            return res.status(401).json({message: 'You are unAthorized to access this data'}); 
        } 
        return res.status(200).json({message: 'Loan Details Request Success', loan: response }); 
    } catch (error) {
        return res.status(500).json({message: 'Create Borrowed Book Failed. Server Error.', error_details:{...error}});
    }
} 

const UpdateLoanDueDate = async(req, res) => {
    try {
        const {id_loan} = req.params;        
        if(id_loan !== req.body._id) {
            return res.status(400).json({message: 'Loan Returning book Failed'});
        }
        // validate if they have 3 warning in not fulfilling returning on time the book;

        let loan = await LoanClass.loanFind(id_loan);

        // if(loan && loan.user.warning >= 3) {
        //     return res.status(400).json({message: 'this user has many book not return in time.'});
        // }

        let currentDateTime = new Date();
        let date = currentDateTime.toISOString('en-US', { timeZone: 'Asia/Manila' });

        if(!loan.due_date >= date) {
            await UserClass.userIncWarning(loan.user._id);
        }

        let loanresponse = await LoanClass.loanUpdateDueDate(id_loan);
        let bookResponse = await BookClass.bookReturn(loanresponse.book._id);

        if(bookResponse.copies != 0 && bookResponse.status == 'unavailable') {
            bookResponse = await BookClass.bookUpdateStatus(bookResponse._id, 'available')
        }

        if(loanresponse && bookResponse) {
            return res.status(200).json({message: 'Loan Update Request Success', loan: loanresponse }); 
        } 
            return res.status(200).json({message: 'Loan Update Request Success', loan: loanresponse }); 
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: 'Loan Update Failed. Server Error.', error_details:{...error}});
    }
} 


const LoansListUser = async(req, res) => {
    try {
        let {user_id} = req.params;
        let pageNumber = parseInt(req?.query?.page) || 1;
        let limit = 1;
        let loans = await LoanClass.loansUser(pageNumber, limit, user_id);
        return res.status(200).json({message: 'Loan List By User Request Success', loans });
    } catch (error) {
        return res.status(500).json({message: 'Loan List By User Failed. Server Error.', error_details:{...error}});
    }
} 

const LoanDashBoardDatas = async(req, res) => {
    try {
        let loanscount = await LoanClass.AdminDashboardDatas();
        return res.status(200).json({message: 'Loan Counts Request Success', loanscount });
    } catch (error) {
        return res.status(500).json({message: 'Loan Counts Request Failed. Server Error.', error_details:{...error}});
    }
}

const LoanDashBoardDataUser = async(req, res) => {
    try {
        const {id_user} = req.params;
        let loanscount = await LoanClass.UserDashboardDatas(id_user);
        return res.status(200).json({message: 'Loan Counts Request Success', loancount: loanscount[0] });
    } catch (error) {
        return res.status(500).json({message: 'Loan Counts Request Failed. Server Error.', error_details:{...error}});
    }
}




module.exports = {
    RegisterBookBorrowed,
    LoansList,
    LoansFindId,
    UpdateLoanDueDate,
    SendEmailNotifLoanReturn,
    LoansListUser,
    LoanDashBoardDatas,
    LoanDashBoardDataUser
}