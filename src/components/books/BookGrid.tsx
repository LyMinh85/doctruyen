import React from 'react';
import BookCard from './BookCard';
import { Book } from '@prisma/client';

interface BookGridProps {
  title: string;
  books: Book[];
  className?: string;
}

const BookGrid: React.FC<BookGridProps> = ({ title, books, className = '' }) => {
  if (!books || books.length === 0) {
    return null;
  }

  return (
    <section className={`w-full ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h2>
        {books.length > 8 && (
          <a 
            href="/books" 
            className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            See All
          </a>
        )}
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {books.map((book) => (
          <BookCard
            key={book.id}
            id={book.id}
            title={book.title}
            author={book.author}
            coverUrl={book.cover_url}
            status={book.status}
            type={book.type}
            isVip={book.is_vip}
            viewsCount={book.views_count}
            likesCount={book.likes_count}
            wordsCount={book.words_count}
          />
        ))}
      </div>
    </section>
  );
};

export default BookGrid;
