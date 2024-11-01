import React, { useState, useEffect, useCallback } from 'react';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import { Wrap, SearchHeader, SearchInput, SearchButton, Image, AddButton, Body } from './ImageGalleryStyles';

const API_KEY = '43135945-0fa309f6e906fbaa5e36dac33';
const BASE_URL = 'https://pixabay.com/api/';

const ImageGallery = () => {
    const [search, setSearch] = useState('');
    const [images, setImages] = useState([]);
    const [page, setPage] = useState(1);
    const [showMoreBtn, setShowMoreBtn] = useState(false);
    const [largeImage, setLargeImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchImages = useCallback(async () => {
        if (!search) return;

        setLoading(true);
        try {
            const response = await fetch(
                `${BASE_URL}?image_type=photo&orientation=horizontal&q=${search}&page=${page}&per_page=12&key=${API_KEY}`
            );
            const data = await response.json();
            setImages((prevImages) => (page === 1 ? data.hits : [...prevImages, ...data.hits]));
            setShowMoreBtn(data.totalHits > 12 * page);

            if (page === 1) {
                iziToast.success({
                    message: `Ви отримали ${data.totalHits} зобрадень`,
                    position: 'topRight',
                });
            } else if (!data.hits.length) {
                iziToast.info({
                    message: `Ви отримаали усі зображення`,
                    position: 'topRight',
                });
            }
        } catch (error) {
            iziToast.error({
                message: 'Помилка завантаження',
                position: 'topRight',
            });
        } finally {
            setLoading(false);
        }
    }, [search, page]);

    useEffect(() => {
        fetchImages();
    }, [fetchImages]);

    const handleSearch = (e) => {
        e.preventDefault();
        const searchQuery = e.target.elements.search.value;
        setSearch(searchQuery);
        setPage(1);
        setImages([]);
    };

    const loadMoreImages = () => setPage((prevPage) => prevPage + 1);

    const openModal = (largeImageUrl) => setLargeImage(largeImageUrl);

    const closeModal = () => setLargeImage(null);

    return (
        <Body>
            <SearchHeader>
                <form onSubmit={handleSearch}>
                    <SearchInput name="search" type="text" />
                    <SearchButton type="submit">Search</SearchButton>
                </form>
            </SearchHeader>

            <Wrap>
                {images.map(({ id, webformatURL, largeImageURL, tags }) => (
                    <Image
                        key={id}
                        src={webformatURL}
                        alt={tags}
                        onClick={() => openModal(largeImageURL)}
                    />
                ))}
            </Wrap>

            {showMoreBtn && !loading && (
                <AddButton onClick={loadMoreImages}>Add more images</AddButton>
            )}

            {loading && <div>Loading...</div>}

            {largeImage && (
                <div className="overlay" onClick={closeModal}>
                    <div className="modal">
                        <img src={largeImage} alt="" />
                    </div>
                </div>
            )}
        </Body>
    );
};

export default ImageGallery;