import {useState} from "react";
function SearchBar(){
    const [search, setSearch] = useState("");
    return (
        <div>
            <input
                type="text"
                placeholder="Search users...."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-80 px-4 py-2 rounded-full bg-zinc-800 text-white outline-none"
            />
            
                
                
        </div>
    )
}

export default SearchBar;