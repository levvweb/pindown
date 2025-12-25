import axios from 'axios';

export default async function handler(req, res) {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ status: 'error', message: 'URL is required' });
    }

    try {
        const response = await axios.get('https://pinterest-downloader-download-pinterest-image-video-and-reels.p.rapidapi.com/pins/info', {
            params: { url },
            headers: {
                'content-type': 'application/json',
                'x-rapidapi-host': 'pinterest-downloader-download-pinterest-image-video-and-reels.p.rapidapi.com',
                'x-rapidapi-key': '0b54688e52msh9f5155a08141c69p1073e8jsnc51fa988e886'
            }
        });

        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.response?.data?.message || error.message || 'Internal Server Error'
        });
    }
}
