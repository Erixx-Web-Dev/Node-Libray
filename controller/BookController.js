const {BookClass} = require('../class/BookClass');
const {LoanClass} = require('../class/LoanClass');


const RegisterBook = async (req, res) => {
    try {
        const {title, isbn, author, categories, copies, image} = req.body;
        let response = await BookClass.addBook({title, isbn, author, categories, copies, image, status: copies >= 1 ? 'available' : 'unavailable'});
        if(response) {
            return res.status(200).json({message: 'Register New Book Success', book: response });
        }
        return res.status(400).json({message: 'Register Failed'});
    } catch (error) {
        return res.status(500).json({message: 'Registration New Book Failed. Server Error.', error_details:{...error}});
    }
}

const BooksAll = async(req, res) => {
    try {
        const pageNumber = parseInt(req?.query?.page) || 1;
        const searchInput = {
            title: req?.query?.title || '',
            isbn: req?.query?.isbn || '',
            author: req?.query?.author || '',
            status: req?.query?.status ? req?.query?.status == 'all' ? '' : req.query.status : ''
        }
        const limit = 2;
        let response = await BookClass.books(pageNumber, limit, searchInput);
        return res.status(200).json({message: 'Request Book List Success', books: response });
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Request Book List Failed. Server Error.', error_details: Object.values(error)});
    }
}

const GetBook = async(req, res) => {
    try {
        const {id} = req.params;
        let response = await BookClass.bookFind(id);
        return res.status(200).json({message: 'Request Book Success', book: response });
    } catch (error) {
        return res.status(500).json({message: 'Registration New Book Failed. Server Error.', error_details:{...error}});
    }
}

const RemoveBook = async(req, res) => {
    try {
        const {id_book} = req.params;
        let count = await LoanClass.countBookLoan(id_book);

        if(count >= 1) {
            return res.status(400).json({message: 'Cannot Delete this book. other copies was borrowed.'});
        }

        let response = await BookClass.bookRemove(id_book);

        if(!response) {
            return res.status(400).json({message: 'Book Remove Failed.'});
        }
        return res.status(200).json({message: 'Request Book Delete Success'});
    } catch (error) {
        return res.status(500).json({message: 'Request Book Delete Failed. Server Error.', error_details:{...error}});
    }
}


const UpdateBook = async (req, res) => {
    try {
        const {id} = req.params;
        const {title, isbn, author, categories, copies, image} = req.body;
        let response = await BookClass.bookUpdate({id, title, isbn, author, categories, copies, image, status: copies >= 1 ? 'available' : 'unavailable'});
        if(response) {
            return res.status(200).json({message: 'Updating Book Success', book: response });
        }
        return res.status(400).json({message: 'Updating Book Failed'});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Updating Book Failed. Server Error.', error_details: {...error}});
    }
}

// const RemoveBook = async(req, res) => {
//     try {
//         const {id} = req.params;
//         let {copies} = await BookClass.bookFind(id);

//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({message: 'Updating Book Failed. Server Error.', error_details: {...error}});
//     }
// }

const BooksDashBoard = async(req, res) => {
    try {
        let datas = await BookClass.booksDashBoardAdmin();
        return res.status(200).json({message: 'Book DashBoard Request Success', datas });
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Book DashBoard Request Failed. Server Error.', error_details: {...error}});
    }
}

const SearchBooks = async(req, res) => {
    try {
        const {search} = req.body;
        let books = await BookClass.bookSearching(search);
        return res.status(200).json({message: 'Book Search Success', books });
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Updating Book Failed. Server Error.', error_details: {...error}});
    }
}


module.exports = {
    RegisterBook,
    BooksAll,
    GetBook,
    UpdateBook,
    SearchBooks,
    BooksDashBoard,
    RemoveBook
}