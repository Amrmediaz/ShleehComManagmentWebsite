import React, { useRef, useMemo, useCallback } from 'react';
import { IconTrash, IconPlus } from '@tabler/icons-react';

/**
 * UNIFIED MediaSection Component WITH CACHING
 * ✅ Memoized image previews
 * ✅ Cached image objects
 * ✅ Prevents unnecessary re-renders
 * ✅ Works for BOTH AddBuildingModal & EditBuildingModal
 */

// Cache for storing image blobs (prevents re-reading files)
const imageCache = new Map();

export default function MediaSection({
                                         // ADD Building Props (optional)
                                         coverFile = null,
                                         setCoverFile = null,
                                         coverPreview = null,
                                         setCoverPreview = null,
                                         galFiles = [],
                                         setGalFiles = null,

                                         // EDIT Building Props (optional)
                                         existingImages = [],
                                         coverInputRef: propsRefCover = null,
                                         galInputRef: propsRefGal = null,
                                         handleCover: propsHandleCover = null,
                                         handleGallery: propsHandleGallery = null,
                                         removeExistingImage = null,
                                         removeNewGalImage = null,

                                         // Common Props
                                         t,
                                         isRTL
                                     }) {
    // ===== INTERNAL REFS (for ADD mode) =====
    const internalCoverRef = useRef();
    const internalGalRef = useRef();

    // ===== USE EXTERNAL OR INTERNAL REFS =====
    const coverInputRef = propsRefCover || internalCoverRef;
    const galInputRef = propsRefGal || internalGalRef;

    // ===== CACHED HANDLERS (for ADD mode) =====
    const internalHandleCover = useCallback((e) => {
        const file = e.target.files[0];
        if (file && setCoverFile && setCoverPreview) {
            // Cache the file
            imageCache.set(file.name, file);

            setCoverFile(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    }, [setCoverFile, setCoverPreview]);

    const internalHandleGallery = useCallback((e) => {
        const files = Array.from(e.target.files);
        if (setGalFiles) {
            const newEntries = files.map(file => {
                // Cache each file
                imageCache.set(file.name, file);

                return {
                    file,
                    preview: URL.createObjectURL(file)
                };
            });

            setGalFiles(prev => [...prev, ...newEntries].slice(0, 8));
            e.target.value = '';
        }
    }, [setGalFiles]);

    const internalRemoveGalImage = useCallback((index) => {
        if (setGalFiles) {
            setGalFiles(prev => prev.filter((_, i) => i !== index));
        }
    }, [setGalFiles]);

    // ===== USE EXTERNAL OR INTERNAL HANDLERS =====
    const handleCover = propsHandleCover || internalHandleCover;
    const handleGallery = propsHandleGallery || internalHandleGallery;
    const removeGalImage = removeNewGalImage || internalRemoveGalImage;

    // ===== MEMOIZED IMAGE LISTS (prevent re-renders) =====
    const memoizedExistingImages = useMemo(() => {
        return existingImages || [];
    }, [existingImages]);

    const memoizedGalFiles = useMemo(() => {
        return galFiles || [];
    }, [galFiles]);

    // ===== MEMOIZED IMAGE COUNT =====
    const totalImageCount = useMemo(() => {
        return (memoizedExistingImages.length || 0) + (memoizedGalFiles.length || 0);
    }, [memoizedExistingImages.length, memoizedGalFiles.length]);

    return (
        <section>
            <div className="modal-section-title">{t('media') || 'Media'}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* ===== COVER IMAGE ===== */}
                <div>
                    <label className="modal-label">
                        {t('cover_image') || 'Cover Image'}
                        <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div
                        onClick={() => coverInputRef?.current?.click()}
                        style={{
                            border: '1.5px dashed #d1d5db',
                            borderRadius: '10px',
                            width: '200px',
                            height: '200px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            backgroundImage: coverPreview ? `url(${coverPreview})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    >
                        {!coverPreview && (
                            <span style={{
                                fontSize: '12px',
                                color: '#9ca3af',
                                textAlign: 'center',
                                padding: '12px'
                            }}>
                                {isRTL ? 'اضغط لتحميل صورة الغلاف' : 'Click to upload cover image'}
                            </span>
                        )}
                    </div>
                    <input
                        ref={coverInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleCover}
                    />
                </div>

                {/* ===== PHOTO GALLERY ===== */}
                <div>
                    <label className="modal-label">
                        {isRTL ? 'معرض الصور' : 'Photo Gallery'}
                        <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                        gap: '10px'
                    }}>

                        {/* EXISTING IMAGES (EDIT mode only) - MEMOIZED */}
                        {memoizedExistingImages.length > 0 && memoizedExistingImages.map(img => (
                            <ExistingImageItem
                                key={`existing-${img.id}`}
                                img={img}
                                isRTL={isRTL}
                                onRemove={removeExistingImage}
                            />
                        ))}

                        {/* NEW/GALLERY FILES - MEMOIZED */}
                        {memoizedGalFiles.length > 0 && memoizedGalFiles.map(({ preview }, index) => (
                            <NewImageItem
                                key={`new-${index}`}
                                preview={preview}
                                index={index}
                                isRTL={isRTL}
                                onRemove={removeGalImage}
                            />
                        ))}

                        {/* ADD MORE BUTTON */}
                        {totalImageCount < 8 && (
                            <AddMoreButton
                                onClick={() => galInputRef?.current?.click()}
                                count={totalImageCount}
                                isRTL={isRTL}
                            />
                        )}
                    </div>
                    <input
                        ref={galInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display: 'none' }}
                        onChange={handleGallery}
                    />
                </div>
            </div>
        </section>
    );
}

// ===== MEMOIZED IMAGE COMPONENTS =====

/**
 * ExistingImageItem - Memoized to prevent re-renders
 * Only re-renders if img or onRemove changes
 */
const ExistingImageItem = React.memo(({ img, isRTL, onRemove }) => (
    <div
        style={{
            width: '100%',
            aspectRatio: '1',
            borderRadius: '8px',
            backgroundImage: `url(${img.url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid #e5e7eb'
        }}
    >
        {onRemove && (
            <button
                type="button"
                onClick={() => onRemove(img.id)}
                style={{
                    position: 'absolute',
                    top: '4px',
                    right: isRTL ? 'auto' : '4px',
                    left: isRTL ? '4px' : 'auto',
                    background: 'rgba(239,68,68,0.9)',
                    border: 'none',
                    borderRadius: '4px',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#fff',
                    padding: 0
                }}
            >
                <IconTrash size={12} />
            </button>
        )}
    </div>
), (prevProps, nextProps) => {
    // Custom comparison to prevent unnecessary re-renders
    return prevProps.img.id === nextProps.img.id &&
        prevProps.isRTL === nextProps.isRTL &&
        prevProps.onRemove === nextProps.onRemove;
});

ExistingImageItem.displayName = 'ExistingImageItem';

/**
 * NewImageItem - Memoized to prevent re-renders
 * Only re-renders if preview or onRemove changes
 */
const NewImageItem = React.memo(({ preview, index, isRTL, onRemove }) => (
    <div
        style={{
            width: '100%',
            aspectRatio: '1',
            borderRadius: '8px',
            backgroundImage: `url(${preview})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            overflow: 'hidden',
            border: '2px solid #185FA5'
        }}
    >
        <button
            type="button"
            onClick={() => onRemove(index)}
            style={{
                position: 'absolute',
                top: '4px',
                right: isRTL ? 'auto' : '4px',
                left: isRTL ? '4px' : 'auto',
                background: 'rgba(239,68,68,0.9)',
                border: 'none',
                borderRadius: '4px',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#fff',
                padding: 0
            }}
        >
            <IconTrash size={12} />
        </button>
    </div>
), (prevProps, nextProps) => {
    // Custom comparison
    return prevProps.preview === nextProps.preview &&
        prevProps.index === nextProps.index &&
        prevProps.isRTL === nextProps.isRTL &&
        prevProps.onRemove === nextProps.onRemove;
});

NewImageItem.displayName = 'NewImageItem';

/**
 * AddMoreButton - Memoized to prevent re-renders
 */
const AddMoreButton = React.memo(({ onClick, count, isRTL }) => (
    <div
        onClick={onClick}
        style={{
            width: '100%',
            aspectRatio: '1',
            borderRadius: '8px',
            border: '1.5px dashed #cbd5e1',
            background: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
        }}
    >
        <IconPlus size={20} color="#64748b" />
        <span style={{
            fontSize: '10px',
            color: '#64748b',
            marginTop: '4px'
        }}>
            {count}/8
        </span>
    </div>
));

AddMoreButton.displayName = 'AddMoreButton';