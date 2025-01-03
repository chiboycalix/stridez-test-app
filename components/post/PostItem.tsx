// 'use client'

// import React, { useEffect, useState } from 'react'
// import { useAuth } from '@/context/AuthContext'
// import { PostType, usePost } from '@/context/PostContext'
// import TimeFormatter from '../../utils/TimeFormatter'
// import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
// import {
//   FaHeart,
//   FaRegComment,
//   FaBookmark,
//   FaEye,
//   FaShareAlt,
//   FaTwitter,
// } from 'react-icons/fa'
// import { AiOutlineLink } from 'react-icons/ai'
// import { SiWhatsapp, SiTelegram, SiFacebook } from 'react-icons/si'
// import MediaWrapper from './MediaWrapper'
// import FollowButton from '../ui/FollowButton'
// import { useRouter } from 'next/navigation'
// import Link from 'next/link'
// import Image from 'next/image'

// type PostItemType = {
//   post: PostType
// }

// type postSideMenuType = {
//   icon: any
//   value: number
//   alt: string
//   onClick: React.MouseEvent<HTMLButtonElement | HTMLDivElement, MouseEvent>
//   colorClass?: string
// }

// const PostItem = ({ post }: PostItemType) => {
//   const { likePost } = usePost()
//   const { getAuth, getCurrentUser } = useAuth()
//   const router = useRouter()
//   const currId = getCurrentUser()?.id
//   const socialsUrl = 'https://stridez-dev.onrender.com'

//   // State for like button color and count
//   const [isLiked, setIsLiked] = useState(false)
//   const [likeCount, setLikeCount] = useState(post?.metadata?.likesCount || 0)

//   const handleLikeClick = async () => {
//     if (!getAuth()) return router.push('/auth')

//     // Optimistically update UI
//     const newLikeState = !isLiked
//     setIsLiked(newLikeState)
//     setLikeCount(likeCount + (newLikeState ? 1 : -1))
//     localStorage.setItem(`post-like-${post.id}`, JSON.stringify(newLikeState))

//     try {
//       // Send like request to backend
//       await likePost(post.id)
//     } catch (error) {
//       setIsLiked(!newLikeState)
//       setLikeCount(likeCount + (newLikeState ? -1 : 1))
//       console.error('Error liking post:', error)
//     }
//   }

//   const handleCommentClick = (
//     e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>
//   ) => {
//     e.preventDefault()
//     router.push(`/posts/${post.id}`)
//   }

//   const postSideMenu: any[] = [
//     {
//       icon: <FaHeart />,
//       value: likeCount,
//       alt: 'likes',
//       onClick: handleLikeClick,
//       colorClass: isLiked ? 'text-red-500' : 'text-gray-700',
//     },
//     {
//       icon: <FaRegComment />,
//       value: post?.metadata?.commentsCount,
//       alt: 'comments',
//       onClick: handleCommentClick,
//     },

//     {
//       icon: <FaBookmark />,
//       value: post?.metadata?.archiveCount,
//       alt: 'pinned',
//     },
//     post &&
//     post?.mediaResource?.[0]?.mimeType === 'video/*' && {
//       icon: <FaEye />,
//       value: post?.mediaResource?.[0]?.metadata?.viewsCount || 0,
//       alt: 'views',
//     },
//   ].filter(Boolean)

//   const shareOptionsMenu = [
//     { icon: <AiOutlineLink />, alt: 'Copy link', text: 'Copy link' },
//     {
//       icon: <SiWhatsapp />,
//       alt: 'WhatsApp',
//       text: 'Share to WhatsApp',
//       link: `https://api.whatsapp.com/send/?text=${socialsUrl}/p/${post.id}&type=custom_url&app_absent=0`,
//     },
//     { icon: <SiTelegram />, alt: 'Telegram', text: 'Share to Telegram' },
//     {
//       icon: <SiFacebook />,
//       alt: 'Facebook',
//       text: 'Share to Facebook',
//       link: `https://www.facebook.com/sharer/sharer.php?display=popup&sdk=joey&u=${socialsUrl}/p/${post.id} `,
//     },
//     {
//       icon: <FaTwitter />,
//       alt: 'Twitter',
//       text: 'Share to Twitter',
//       link: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
//         socialsUrl + '/p/' + post.id
//       )}&text=${encodeURIComponent(post.title)}`,
//     },
//   ]
//   const formatTime = (date: string) => TimeFormatter(new Date(date))

//   useEffect(() => {
//     const liked = localStorage.getItem(`post-like-${post.id}`)
//     if (liked) {
//       setIsLiked(true)
//     }
//   }, [isLiked, post.id])

//   return (
//     <div
//       className="m-auto p-3 shadow-md border rounded-2xl bg-white"
//       role="article"
//       aria-label={`Post by ${post.username}`}
//     >
//       <div className="py-3 pl-2 bg-transparent rounded relative flex-col w-[28rem]">
//         {/* Header Section */}
//         <div className="flex justify-between items-center mb-2 max-w-[27rem] w-full">
//           <div className="flex items-start">
//             {/* User Avatar */}
//             <Image
//               width={20}
//               height={20}
//               src={post.avatar}
//               alt={`${post.username}'s avatar`}
//               className="w-10 h-10 rounded-full mr-3"
//             />
//             {/* User Info */}
//             <div>
//               <div className="flex flex-col gap-1">
//                 <div className="text-gray-800 font-semibold">
//                   <Link
//                     href={`/profile/${post.userId}`}
//                     aria-label={`View ${post.username}'s profile`}
//                   >
//                     {post.username}
//                   </Link>
//                 </div>
//                 <div className="text-gray-500">
//                   {formatTime(post.createdAt)}
//                 </div>
//               </div>
//             </div>
//           </div>
//           {/* Follow Button */}
//           {post.userId !== currId && <FollowButton followedId={post.userId} />}
//         </div>

//         {/* Post Content */}
//         <div>
//           <h3 className="text-base text-gray-700 font-semibold">
//             {post.title}
//           </h3>
//           <p className="text-blue-500 text-sm">{post.body}</p>
//         </div>

//         {/* Media & Side Menu */}
//         <div className="flex gap-3">
//           {/* Media */}
//           <MediaWrapper
//             postId={post.id}
//             title={post.title}
//             size="min-h-[30rem] max-h-[38rem] relative rounded-2xl w-[24rem]"
//             postMedia={post.mediaResource}
//           />

//           {/* Side Menu */}
//           <div
//             className="flex justify-end flex-col items-center text-gray-700 font-medium text-xs"
//             role="menu"
//             aria-label="Post actions menu"
//           >
//             {postSideMenu.map((menu, index) => (
//               <div
//                 className={`flex flex-col items-center mb-3 cursor-pointer ${menu.colorClass}`}
//                 key={index}
//                 onClick={menu.onClick}
//                 role="menuitem"
//                 tabIndex={0}
//                 aria-label={menu.value}
//               >
//                 <div className="p-1.5 shadow-md text-lg rounded-full mb-px">
//                   {menu.icon}
//                 </div>
//                 <span>{menu.value}</span>
//               </div>
//             ))}

//             {/* Share Options */}
//             <Popover className="relative w-full">
//               <Popover.Button
//                 className="flex flex-col items-center w-full outline-none border-none"
//                 aria-label="Share post"
//               >
//                 <div className="p-2 rounded-full shadow-md">
//                   <FaShareAlt className="text-lg text-gray-700" />
//                 </div>
//                 <span>{post.metadata.shareCount}</span>
//               </Popover.Button>
//               <Popover.Panel
//                 className="absolute z-10 transition-all duration-500 ease-in-out bg-gray-50 shadow-md rounded px-2 py-2.5 mt-2 w-48"
//                 role="menu"
//                 aria-label="Share options"
//               >
//                 {shareOptionsMenu.map((option, i) => (
//                   <a
//                     href={option.link}
//                     target="_blank"
//                     rel="noreferrer"
//                     key={i}
//                     className="flex items-center w-full space-x-2 hover:bg-gray-100 p-2 rounded"
//                     aria-label={`Share on ${option.text}`}
//                   >
//                     {option.icon}
//                     <span>{option.text}</span>
//                   </a>
//                 ))}
//               </Popover.Panel>
//             </Popover>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default PostItem


'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { PostType, usePost } from '@/context/PostContext'
import TimeFormatter from '../../utils/TimeFormatter'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import {
  FaHeart,
  FaRegComment,
  FaBookmark,
  FaEye,
  FaShareAlt,
  FaTwitter,
} from 'react-icons/fa'
import { AiOutlineLink } from 'react-icons/ai'
import { SiWhatsapp, SiTelegram, SiFacebook } from 'react-icons/si'
import MediaWrapper from './MediaWrapper'
import FollowButton from '../ui/FollowButton'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

type PostItemType = {
  post: PostType
}

type postSideMenuType = {
  icon: any
  value: number
  alt: string
  onClick: React.MouseEvent<HTMLButtonElement | HTMLDivElement, MouseEvent>
  colorClass?: string
}

const PostItem = ({ post }: PostItemType) => {
  const { likePost } = usePost()
  const { getAuth, getCurrentUser } = useAuth()
  const router = useRouter()
  const currId = getCurrentUser()?.id
  const socialsUrl = 'https://stridez-dev.onrender.com'

  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post?.metadata?.likesCount || 0)

  const handleLikeClick = async () => {
    if (!getAuth()) return router.push('/auth')

    const newLikeState = !isLiked
    setIsLiked(newLikeState)
    setLikeCount(likeCount + (newLikeState ? 1 : -1))
    localStorage.setItem(`post-like-${post.id}`, JSON.stringify(newLikeState))

    try {
      await likePost(post.id)
    } catch (error) {
      setIsLiked(!newLikeState)
      setLikeCount(likeCount + (newLikeState ? -1 : 1))
      console.error('Error liking post:', error)
    }
  }

  const handleCommentClick = (
    e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>
  ) => {
    e.preventDefault()
    router.push(`/posts/${post.id}`)
  }

  const postSideMenu: any[] = [
    {
      icon: <FaHeart />,
      value: likeCount,
      alt: 'likes',
      onClick: handleLikeClick,
      colorClass: isLiked ? 'text-red-500' : 'text-gray-700',
    },
    {
      icon: <FaRegComment />,
      value: post?.metadata?.commentsCount,
      alt: 'comments',
      onClick: handleCommentClick,
    },
    {
      icon: <FaBookmark />,
      value: post?.metadata?.archiveCount,
      alt: 'pinned',
    },
    post &&
    post?.mediaResource?.[0]?.mimeType === 'video/*' && {
      icon: <FaEye />,
      value: post?.mediaResource?.[0]?.metadata?.viewsCount || 0,
      alt: 'views',
    },
  ].filter(Boolean)

  const shareOptionsMenu = [
    { icon: <AiOutlineLink />, alt: 'Copy link', text: 'Copy link' },
    {
      icon: <SiWhatsapp />,
      alt: 'WhatsApp',
      text: 'Share to WhatsApp',
      link: `https://api.whatsapp.com/send/?text=${socialsUrl}/p/${post.id}&type=custom_url&app_absent=0`,
    },
    { icon: <SiTelegram />, alt: 'Telegram', text: 'Share to Telegram' },
    {
      icon: <SiFacebook />,
      alt: 'Facebook',
      text: 'Share to Facebook',
      link: `https://www.facebook.com/sharer/sharer.php?display=popup&sdk=joey&u=${socialsUrl}/p/${post.id} `,
    },
    {
      icon: <FaTwitter />,
      alt: 'Twitter',
      text: 'Share to Twitter',
      link: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        socialsUrl + '/p/' + post.id
      )}&text=${encodeURIComponent(post.title)}`,
    },
  ]

  const formatTime = (date: string) => TimeFormatter(new Date(date))

  useEffect(() => {
    const liked = localStorage.getItem(`post-like-${post.id}`)
    if (liked) {
      setIsLiked(true)
    }
  }, [isLiked, post.id])

  return (
    <div className="mx-auto p-3 shadow-md border rounded-2xl bg-white w-full max-w-[28rem] sm:max-w-[30rem] md:max-w-[32rem]">
      <div className="py-3 px-2 bg-transparent rounded relative w-full">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-2 w-full">
          <div className="flex items-start">
            {/* User Avatar */}
            <Image
              width={40}
              height={40}
              src={post.avatar}
              alt={`${post.username}'s avatar`}
              className="w-10 h-10 rounded-full mr-3"
            />
            {/* User Info */}
            <div>
              <div className="flex flex-col gap-1">
                <div className="text-gray-800 font-semibold">
                  <Link
                    href={`/profile/${post.userId}`}
                    aria-label={`View ${post.username}'s profile`}
                  >
                    {post.username}
                  </Link>
                </div>
                <div className="text-gray-500 text-sm">
                  {formatTime(post.createdAt)}
                </div>
              </div>
            </div>
          </div>
          {/* Follow Button */}
          {post.userId !== currId && <FollowButton followedId={post.userId} />}
        </div>

        {/* Post Content */}
        <div className="mb-4">
          <h3 className="text-base text-gray-700 font-semibold">
            {post.title}
          </h3>
          <p className="text-blue-500 text-sm">{post.body}</p>
        </div>

        {/* Media */}
        <div className="w-full mb-4">
          <MediaWrapper
            postId={post.id}
            title={post.title}
            size="w-full h-auto aspect-square rounded-2xl"
            postMedia={post.mediaResource}
          />
        </div>

        {/* Bottom Action Menu */}
        <div className="flex justify-between items-center px-2 pt-2 border-t">
          <div className="flex space-x-6">
            {postSideMenu.map((menu, index) => (
              <div
                className={`flex items-center space-x-1 cursor-pointer ${menu.colorClass}`}
                key={index}
                onClick={menu.onClick}
                role="menuitem"
                tabIndex={0}
                aria-label={menu.alt}
              >
                <div className="text-xl">{menu.icon}</div>
                <span className="text-sm">{menu.value}</span>
              </div>
            ))}
          </div>

          {/* Share Options */}
          <Popover className="relative">
            <Popover.Button
              className="flex items-center space-x-1 outline-none border-none"
              aria-label="Share post"
            >
              <FaShareAlt className="text-xl text-gray-700" />
              <span className="text-sm">{post.metadata.shareCount}</span>
            </Popover.Button>
            <Popover.Panel
              className="absolute z-10 bottom-full right-0 mb-2 transition-all duration-500 ease-in-out bg-gray-50 shadow-md rounded px-2 py-2.5 w-48"
              role="menu"
              aria-label="Share options"
            >
              {shareOptionsMenu.map((option, i) => (
                <a
                  href={option.link}
                  target="_blank"
                  rel="noreferrer"
                  key={i}
                  className="flex items-center w-full space-x-2 hover:bg-gray-100 p-2 rounded"
                  aria-label={`Share on ${option.text}`}
                >
                  {option.icon}
                  <span>{option.text}</span>
                </a>
              ))}
            </Popover.Panel>
          </Popover>
        </div>
      </div>
    </div>
  )
}

export default PostItem