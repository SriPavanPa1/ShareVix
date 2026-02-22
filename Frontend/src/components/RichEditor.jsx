import React, { useCallback, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { mediaAPI } from '../services/api'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image as ImageIcon,
  Link as LinkIcon,
  Copy,
  Loader
} from 'lucide-react'
import '../styles/RichEditor.css'

const RichEditor = ({ content, onChange, blogId, ownerType = 'blog', ownerId }) => {
  const [uploading, setUploading] = useState(false)
  const currentOwnerId = ownerId || blogId // Support both prop names for compatibility

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  const handleImageUpload = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (event) => {
      const file = event.target.files[0]
      if (!file) return

      if (file.size > 10 * 1024 * 1024) {
        alert('Image size should be less than 10MB')
        return
      }

      setUploading(true)
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('owner_type', 'blog')
        if (blogId) formData.append('owner_id', blogId)

        const response = await mediaAPI.uploadInline(formData)
        const imageUrl = response.data?.url

        if (imageUrl && editor) {
          editor.chain().focus().setImage({ src: imageUrl }).run()
        }
      } catch (err) {
        console.error('Image upload failed:', err)
        alert('Failed to upload image. Please try again.')
      } finally {
        setUploading(false)
      }
    }
    input.click()
  }, [editor, blogId])

  const handleVideoUpload = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'video/*'
    input.onchange = async (event) => {
      const file = event.target.files[0]
      if (!file) return

      if (file.size > 100 * 1024 * 1024) {
        alert('Video size should be less than 100MB')
        return
      }

      setUploading(true)
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('owner_type', 'blog')
        if (blogId) formData.append('owner_id', blogId)

        const response = await mediaAPI.uploadInline(formData)
        const videoUrl = response.data?.url

        if (videoUrl && editor) {
          const videoHtml = `<div class="video-wrapper"><video width="100%" controls><source src="${videoUrl}" type="${file.type}"></video></div>`
          editor.chain().focus().insertContent(videoHtml).run()
        }
      } catch (err) {
        console.error('Video upload failed:', err)
        alert('Failed to upload video. Please try again.')
      } finally {
        setUploading(false)
      }
    }
    input.click()
  }, [editor, blogId])

  const handleAddLink = useCallback(() => {
    const url = window.prompt('Enter the URL:')
    if (url) {
      if (editor) {
        editor
          .chain()
          .focus()
          .extendMarkRange('link')
          .setLink({ href: url })
          .run()
      }
    }
  }, [editor])

  if (!editor) {
    return <div>Loading editor...</div>
  }

  return (
    <div className="rich-editor">
      {uploading && (
        <div className="editor-upload-overlay">
          <Loader size={24} className="spin-animation" />
          <span>Uploading media...</span>
        </div>
      )}
      <div className="editor-toolbar">
        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'active' : ''}
            title="Bold (Ctrl+B)"
          >
            <Bold size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'active' : ''}
            title="Italic (Ctrl+I)"
          >
            <Italic size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            disabled={!editor.can().chain().focus().toggleUnderline().run()}
            className={editor.isActive('underline') ? 'active' : ''}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon size={18} />
          </button>
        </div>

        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive('heading', { level: 2 }) ? 'active' : ''}
            title="Heading 2"
          >
            <Heading2 size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={editor.isActive('heading', { level: 3 }) ? 'active' : ''}
            title="Heading 3"
          >
            <Heading3 size={18} />
          </button>
        </div>

        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={editor.isActive({ textAlign: 'left' }) ? 'active' : ''}
            title="Align Left"
          >
            <AlignLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={editor.isActive({ textAlign: 'center' }) ? 'active' : ''}
            title="Align Center"
          >
            <AlignCenter size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={editor.isActive({ textAlign: 'right' }) ? 'active' : ''}
            title="Align Right"
          >
            <AlignRight size={18} />
          </button>
        </div>

        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'active' : ''}
            title="Bullet List"
          >
            <List size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'active' : ''}
            title="Ordered List"
          >
            <ListOrdered size={18} />
          </button>
        </div>

        <div className="toolbar-group">
          <button
            type="button"
            onClick={handleImageUpload}
            title="Insert Image"
            disabled={uploading}
          >
            <ImageIcon size={18} />
          </button>
          <button
            type="button"
            onClick={handleVideoUpload}
            title="Insert Video"
            disabled={uploading}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="23 7 16 12 23 17 23 7"></polygon>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
            </svg>
          </button>
          <button
            type="button"
            onClick={handleAddLink}
            title="Add Link"
          >
            <LinkIcon size={18} />
          </button>
        </div>

        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => editor.chain().focus().clearNodes().run()}
            title="Clear Formatting"
          >
            <Copy size={18} />
          </button>
        </div>
      </div>

      <div className="editor-content">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

export default RichEditor

