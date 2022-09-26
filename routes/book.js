const {Router} = require('express');
const { handleErrors } = require('../helper/Validator-Error');
const router = Router();
const { protect } = require('../middleware/authmiddleware');
const { bookRegister, bookUpdatingValidate } = require('../helper/Validation');
const {RegisterBook, BooksAll, GetBook, UpdateBook, SearchBooks, BooksDashBoard, RemoveBook} = require('../controller/BookController');
const { roleprotect } = require('../middleware/roleMiddleware');


router.post(`/add-new`, protect, roleprotect(['Librarian']), bookRegister, handleErrors, RegisterBook);
router.get(`/all-books`, protect, roleprotect(['Librarian', 'User']), BooksAll);
router.get(`/book-:id`, protect, roleprotect(['Librarian']), GetBook);
router.put(`/book-update/:id`, protect, roleprotect(['Librarian']), bookUpdatingValidate, handleErrors, UpdateBook);
router.delete(`/book-remove/:id`, protect, roleprotect(['Librarian']), UpdateBook);
router.post(`/book-search/details`, protect, roleprotect(['Librarian']), SearchBooks);
// delete books condition need all copies return
router.delete(`/delete/:id_book`, protect, roleprotect(['Librarian']), RemoveBook);


router.get(`/book-dashboard/counts`, protect, roleprotect(['Librarian']), BooksDashBoard);

module.exports = router;