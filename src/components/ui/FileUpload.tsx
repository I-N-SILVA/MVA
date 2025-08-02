import React, { useState, useCallback, useRef } from 'react'
import { Upload, X, File, Image, Video, FileText, AlertCircle } from 'lucide-react'
import { cn, formatFileSize, validateFileType, validateFileSize } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import { Button } from './button'
import { Progress } from './progress'

export interface FileUploadProps {
  accept?: string[]
  maxSize?: number // in bytes
  maxFiles?: number
  onFilesChange?: (files: UploadedFile[]) => void
  onUploadComplete?: (urls: string[]) => void
  onError?: (error: string) => void
  value?: UploadedFile[]
  disabled?: boolean
  bucketName?: string
  folderPath?: string
  className?: string
}

export interface UploadedFile {
  id: string
  file: File
  url?: string
  uploadProgress?: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  error?: string
}

const FileUpload: React.FC<FileUploadProps> = ({
  accept = ['image/*', 'video/*', 'application/pdf'],
  maxSize = 50 * 1024 * 1024, // 50MB default
  maxFiles = 5,
  onFilesChange,
  onUploadComplete,
  onError,
  value = [],
  disabled = false,
  bucketName = 'submissions',
  folderPath = 'uploads',
  className
}) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [files, setFiles] = useState<UploadedFile[]>(value)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="w-8 h-8 text-blue-500" />
    if (file.type.startsWith('video/')) return <Video className="w-8 h-8 text-purple-500" />
    if (file.type === 'application/pdf') return <FileText className="w-8 h-8 text-red-500" />
    return <File className="w-8 h-8 text-gray-500" />
  }

  const validateFile = (file: File): string | null => {
    if (!validateFileType(file, accept)) {
      return `File type ${file.type} is not allowed`
    }
    if (!validateFileSize(file, maxSize)) {
      return `File size ${formatFileSize(file.size)} exceeds maximum allowed size of ${formatFileSize(maxSize)}`
    }
    return null
  }

  const uploadFile = async (uploadedFile: UploadedFile): Promise<string> => {
    const { file } = uploadedFile
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${folderPath}/${fileName}`

    return new Promise((resolve, reject) => {
      const upload = supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      upload.then(({ data, error }) => {
        if (error) {
          reject(new Error(error.message))
          return
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(data.path)

        resolve(urlData.publicUrl)
      }).catch(reject)
    })
  }

  const handleFileUpload = async (uploadedFile: UploadedFile) => {
    try {
      setFiles(prev => prev.map(f => 
        f.id === uploadedFile.id 
          ? { ...f, status: 'uploading' as const, uploadProgress: 0 }
          : f
      ))

      const url = await uploadFile(uploadedFile)

      setFiles(prev => prev.map(f => 
        f.id === uploadedFile.id 
          ? { ...f, status: 'completed' as const, url, uploadProgress: 100 }
          : f
      ))

      const updatedFiles = files.map(f => 
        f.id === uploadedFile.id 
          ? { ...f, status: 'completed' as const, url, uploadProgress: 100 }
          : f
      )
      onFilesChange?.(updatedFiles)

      // Check if all files are uploaded
      const allCompleted = updatedFiles.every(f => f.status === 'completed')
      if (allCompleted) {
        const urls = updatedFiles.map(f => f.url!).filter(Boolean)
        onUploadComplete?.(urls)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      
      setFiles(prev => prev.map(f => 
        f.id === uploadedFile.id 
          ? { ...f, status: 'error' as const, error: errorMessage }
          : f
      ))

      onError?.(errorMessage)
    }
  }

  const processFiles = useCallback((fileList: FileList) => {
    const newFiles: UploadedFile[] = []

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      
      if (files.length + newFiles.length >= maxFiles) {
        onError?.(`Maximum ${maxFiles} files allowed`)
        break
      }

      const validationError = validateFile(file)
      if (validationError) {
        onError?.(validationError)
        continue
      }

      const uploadedFile: UploadedFile = {
        id: `${Date.now()}-${i}`,
        file,
        status: 'pending'
      }

      newFiles.push(uploadedFile)
    }

    if (newFiles.length > 0) {
      const updatedFiles = [...files, ...newFiles]
      setFiles(updatedFiles)
      onFilesChange?.(updatedFiles)

      // Start uploading files
      newFiles.forEach(handleFileUpload)
    }
  }, [files, maxFiles, onError, onFilesChange])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragOver(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    if (disabled) return

    const droppedFiles = e.dataTransfer.files
    if (droppedFiles?.length) {
      processFiles(droppedFiles)
    }
  }, [disabled, processFiles])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled && e.target.files?.length) {
      processFiles(e.target.files)
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [disabled, processFiles])

  const removeFile = useCallback((fileId: string) => {
    const updatedFiles = files.filter(f => f.id !== fileId)
    setFiles(updatedFiles)
    onFilesChange?.(updatedFiles)
  }, [files, onFilesChange])

  const retryUpload = useCallback((file: UploadedFile) => {
    handleFileUpload(file)
  }, [])

  return (
    <div className={cn('w-full', className)}>
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 text-center transition-colors',
          isDragOver && !disabled 
            ? 'border-primary bg-primary/5' 
            : 'border-gray-300 hover:border-gray-400',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept.join(',')}
          multiple={maxFiles > 1}
          onChange={handleFileSelect}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          Drop files here or click to upload
        </p>
        <p className="text-sm text-gray-500">
          Support for {accept.map(type => type.split('/')[0]).join(', ')} files up to {formatFileSize(maxSize)}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Maximum {maxFiles} files
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-6 space-y-3">
          {files.map((uploadedFile) => (
            <div
              key={uploadedFile.id}
              className="flex items-center p-3 bg-gray-50 rounded-lg border"
            >
              <div className="flex-shrink-0 mr-3">
                {getFileIcon(uploadedFile.file)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {uploadedFile.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(uploadedFile.file.size)}
                </p>
                
                {uploadedFile.status === 'uploading' && (
                  <div className="mt-2">
                    <Progress
                      value={uploadedFile.uploadProgress || 0}
                      size="sm"
                      showLabel
                    />
                  </div>
                )}
                
                {uploadedFile.status === 'error' && (
                  <div className="mt-1 flex items-center text-red-600">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    <span className="text-xs">{uploadedFile.error}</span>
                  </div>
                )}
              </div>
              
              <div className="flex-shrink-0 ml-3 flex items-center space-x-2">
                {uploadedFile.status === 'completed' && (
                  <div className="text-green-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                
                {uploadedFile.status === 'error' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => retryUpload(uploadedFile)}
                  >
                    Retry
                  </Button>
                )}
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeFile(uploadedFile.id)}
                  disabled={uploadedFile.status === 'uploading'}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FileUpload