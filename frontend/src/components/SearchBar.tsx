type Props = {
  search:string;
  setSearch:(value:string)=>void;
};

export default function SearchBar({
  search,
  setSearch
}:Props) {

  return (
    <input
      placeholder="Search songs, artists, albums..."
      value={search}
      onChange={(e)=>setSearch(e.target.value)}
      className="search"
    />
  );
}

