type Props = {
  artworkUrl?: string;
};

export default function AlbumArt({
  artworkUrl
}: Props) {

  return (
    <img
      className="album-art"
      src={
        artworkUrl
          ? `http://localhost:8080${artworkUrl}`
          : "https://placehold.co/400x400/1e293b/ffffff?text=🎵"
      }
      alt="Album Art"
    />
  );
}