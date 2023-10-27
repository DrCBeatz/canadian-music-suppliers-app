// SearchForm.tsx

import "./SearchForm.css";

import { useState } from "react";

interface SearchFormProps {
  onSearch: (searchTerm: string) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch }) => {
  const [search, setSearch] = useState<string>("");

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch(search);
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <input
        className="search-form__input"
        type="text"
        placeholder="Search vendors"
        value={search}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setSearch(e.target.value)
        }
      />
      <button className="search-form__button" type="submit">
        Search
      </button>
    </form>
  );
};

export default SearchForm;
