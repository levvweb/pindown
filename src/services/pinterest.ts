import axios from 'axios';

export interface PinterestMedia {
    type: 'image' | 'video' | 'gif';
    url: string;
    width?: number;
    height?: number;
    thumbnail?: string;
}

export interface PinterestData {
    id: string;
    title: string;
    description: string;
    images: PinterestMedia[];
    videos: PinterestMedia[];
    author?: {
        name: string;
        avatar?: string;
    };
}

export async function downloadPinterest(url: string): Promise<PinterestData> {
    if (!url.includes('pin.it') && !url.includes('pinterest.com') && !url.includes('pinterest')) {
        throw new Error('Masukkan URL Pinterest yang valid');
    }

    try {
        const { data } = await axios.get('/api/pins/info', {
            headers: { 'content-type': 'application/json' },
            params: { url }
        });

        if (!data || data.status !== 'success') {
            throw new Error(data?.message || 'Gagal mengambil data');
        }

        const pinData = data.data;

        const result: PinterestData = {
            id: pinData.id || '',
            title: pinData.title || pinData.alt_text || `Pinterest ${pinData.type || 'Pin'}`,
            description: pinData.description?.trim() || '',
            images: [],
            videos: [],
            author: pinData.pinner ? {
                name: pinData.pinner.full_name || pinData.pinner.username || 'Pinterest User',
                avatar: pinData.pinner.image_medium_url || pinData.pinner.image_small_url
            } : undefined
        };

        if (pinData.media) {
            const mediaType = pinData.media.media_type;
            const items = pinData.media.items;

            if (items && typeof items === 'object') {
                if (mediaType === 'image' || mediaType === 'gif') {
                    const sizePriority = ['orig', '736x', '564x', '474x', '236x', '170x', '136x136', '60x60'];

                    for (const size of sizePriority) {
                        if (items[size]?.url) {
                            result.images.push({
                                type: mediaType === 'gif' ? 'gif' : 'image',
                                url: items[size].url,
                                width: items[size].width,
                                height: items[size].height
                            });
                            break;
                        }
                    }

                    if (result.images.length === 0) {
                        const firstItem = Object.values(items)[0] as any;
                        if (firstItem?.url) {
                            result.images.push({
                                type: 'image',
                                url: firstItem.url,
                                width: firstItem.width,
                                height: firstItem.height
                            });
                        }
                    }
                } else if (mediaType === 'video') {
                    const videoPriority = ['V_720P', 'V_480P', 'V_360P', 'V_HLSV4', 'V_HLSV3_MOBILE'];

                    for (const size of videoPriority) {
                        if (items[size]?.url) {
                            result.videos.push({
                                type: 'video',
                                url: items[size].url,
                                width: items[size].width,
                                height: items[size].height,
                                thumbnail: items[size].thumbnail
                            });
                            break;
                        }
                    }

                    if (result.videos.length === 0) {
                        Object.values(items).forEach((item: any) => {
                            if (item?.url && (item.url.includes('.mp4') || item.url.includes('video'))) {
                                result.videos.push({
                                    type: 'video',
                                    url: item.url,
                                    width: item.width,
                                    height: item.height
                                });
                            }
                        });
                    }

                    if (pinData.thumbnails?.orig?.url) {
                        result.images.push({
                            type: 'image',
                            url: pinData.thumbnails.orig.url,
                            width: pinData.thumbnails.orig.width,
                            height: pinData.thumbnails.orig.height
                        });
                    }
                }
            }
        }

        if (result.images.length === 0 && result.videos.length === 0 && pinData.thumbnails) {
            const sizePriority = ['orig', '736x', '564x', '474x', '236x', '170x', '136x136', '60x60'];

            for (const size of sizePriority) {
                if (pinData.thumbnails[size]?.url) {
                    result.images.push({
                        type: 'image',
                        url: pinData.thumbnails[size].url,
                        width: pinData.thumbnails[size].width,
                        height: pinData.thumbnails[size].height
                    });
                    break;
                }
            }
        }

        if (pinData.story_pin_data?.pages) {
            pinData.story_pin_data.pages.forEach((page: any) => {
                if (page.blocks) {
                    page.blocks.forEach((block: any) => {
                        if (block.video?.video_list) {
                            Object.values(block.video.video_list).forEach((vid: any) => {
                                if (vid?.url) {
                                    result.videos.push({ type: 'video', url: vid.url, width: vid.width, height: vid.height });
                                }
                            });
                        }
                        if (block.image?.images) {
                            Object.values(block.image.images).forEach((img: any) => {
                                if (img?.url) {
                                    result.images.push({ type: 'image', url: img.url, width: img.width, height: img.height });
                                }
                            });
                        }
                    });
                }
            });
        }

        if (pinData.carousel_data?.carousel_slots) {
            pinData.carousel_data.carousel_slots.forEach((slot: any) => {
                if (slot.images) {
                    Object.values(slot.images).forEach((img: any) => {
                        if (img?.url) {
                            result.images.push({ type: 'image', url: img.url, width: img.width, height: img.height });
                        }
                    });
                }
            });
        }

        result.images = result.images.filter((img, index, self) =>
            index === self.findIndex(t => t.url === img.url)
        );
        result.videos = result.videos.filter((vid, index, self) =>
            index === self.findIndex(t => t.url === vid.url)
        );

        return result;
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 429) {
                throw new Error('Terlalu banyak request. Coba lagi nanti.');
            }
            throw new Error(error.response?.data?.message || 'Gagal mengambil data');
        }
        throw new Error(error.message || 'Terjadi kesalahan');
    }
}

export async function downloadMedia(url: string, filename: string): Promise<void> {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
    } catch {
        window.open(url, '_blank');
    }
}
