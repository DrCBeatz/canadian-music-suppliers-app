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
    <form className="search-form" onSubmit={handleFormSubmit} data-testid="search-form">
      <input
        className="search-form__input"
        placeholder="Search vendors"
        type="search"
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
