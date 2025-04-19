import Image from "next/image";
import Link from "next/link";
import { BookStatus, BookType } from "@prisma/client";
import { FaEye, FaHeart } from "react-icons/fa";
import { MdAutoStories } from "react-icons/md";
import UnderlineLink from "../common/UnderlineLink";

interface BookCardProps {
  id: number;
  title: string;
  author: string;
  coverUrl: string;
  status: BookStatus;
  type: BookType;
  isVip: boolean;
  viewsCount?: number;
  likesCount?: number;
  wordsCount?: number;
}

const BookCard: React.FC<BookCardProps> = ({
  id,
  title,
  author,
  coverUrl,
  status,
  type,
  isVip,
  viewsCount,
  likesCount,
  wordsCount,
}) => {
  return (
    <div className="group">
      <div className="relative overflow-hidden rounded-lg transition-all duration-300 h-full flex flex-col bg-white dark:bg-gray-800">
        {/* Cover image */}
        <Link
          href={"/books"}
          className="relative aspect-[2/3] overflow-hidden rounded-lg"
        >
          <Image
            src={coverUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
          />

          {/* <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" /> */}

          {/* Book type badge */}
          <div className="absolute top-2 left-2 bg-blue-600/90 text-white text-xs px-2 py-1 rounded">
            {type === "ORIGINAL"
              ? "Original"
              : type === "TRANSLATED"
              ? "Trans"
              : "MT"}
          </div>

          {/* VIP badge */}
          {isVip && (
            <div className="absolute top-2 right-2 bg-amber-500/90 text-white text-xs font-bold px-2 py-1 rounded">
              VIP
            </div>
          )}

          {/* Status badge */}
          <div
            className={`absolute bottom-2 right-2 text-xs px-2 py-1 rounded ${
              status === "ON_GOING" ? "bg-green-500/90" : "bg-purple-500/90"
            } text-white`}
          >
            {status === "ON_GOING" ? "Ongoing" : "Completed"}
          </div>
        </Link>

        {/* Book details */}
        <div className="p-3 flex-grow flex flex-col">
          <h3 className="font-semibold line-clamp-2 text-gray-900 dark:text-gray-100 mb-1 !text-xl">
            <UnderlineLink className="text-xl" href={`/books/${id}`}>{title}</UnderlineLink>
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">
            <UnderlineLink className="text-base" href={`/books/${id}`}>{author}</UnderlineLink>
          </p>

          {/* Stats */}
          {(viewsCount !== undefined ||
            likesCount !== undefined ||
            wordsCount !== undefined) && (
            <div className="mt-auto flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              {viewsCount !== undefined && (
                <div className="flex items-center gap-1">
                  <FaEye />
                  <span>
                    {viewsCount >= 1000
                      ? `${(viewsCount / 1000).toFixed(1)}K`
                      : viewsCount}
                  </span>
                </div>
              )}

              {likesCount !== undefined && (
                <div className="flex items-center gap-1">
                  <FaHeart />
                  <span>
                    {likesCount >= 1000
                      ? `${(likesCount / 1000).toFixed(1)}K`
                      : likesCount}
                  </span>
                </div>
              )}

              {wordsCount !== undefined && (
                <div className="flex items-center gap-1">
                  <MdAutoStories />
                  <span>
                    {wordsCount >= 1000
                      ? `${(wordsCount / 1000).toFixed(0)}K`
                      : wordsCount}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;
