import React from 'react';
import '../../styles/Buildingdetails.css';

/**
 * BuildingImagesTab Component
 * Displays building cover image and gallery with cache-busting
 */
const BuildingImagesTab = ({ coverImg, images, imageLoadError, t }) => {
    const hasCoverImage = coverImg && !imageLoadError;
    const hasGalleryImages = images && images.length > 0;
    const hasAnyImages = hasCoverImage || hasGalleryImages;

    // Helper to append timestamp for cache busting
    const getCacheBustedUrl = (url) => {
        if (!url) return url;
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}t=${Date.now()}`;
    };

    return (
        <div>
            {/* Cover Image */}
            {hasCoverImage && (
                <div className="images-section">
                    <h4 className="images-section__title">
                        {t('cover_image') || 'Cover Image'}
                    </h4>
                    <img
                        src={getCacheBustedUrl(coverImg)}
                        alt="building-cover"
                        className="cover-image"
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                </div>
            )}

            {/* Gallery */}
            {hasGalleryImages && (
                <div className="images-section">
                    <h4 className="images-section__title">
                        {t('gallery') || 'Gallery'} ({images.length})
                    </h4>
                    <div className="images-grid">
                        {images.map((img, index) => (
                            <img
                                key={`img-${img.id}-${index}`}
                                // Assuming your image objects have a 'url' or 'path' property
                                src={getCacheBustedUrl(img.url || img.path)}
                                alt={`gallery-${index}`}
                                className="images-grid__item"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!hasAnyImages && (
                <div className="empty-state">
                    <i className="fa-solid fa-images empty-state__icon" />
                    <p className="empty-state__text">{t('no_images') || 'No images uploaded'}</p>
                </div>
            )}
        </div>
    );
};

export default BuildingImagesTab;