import { GithubUser } from "./GithubUser.js";

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root);
    this.load();
  }

  checkUserLength() {
    const emptyState = this.root.querySelector(".empty-state");
    if (this.entries.length === 0) {
      emptyState.style.display = "";
    } else {
      emptyState.style.display = "none";
    }
  }

  load() {
    const data = localStorage.getItem("@github-favorites:");
    if (data) {
      try {
        this.entries = JSON.parse(data);
      } catch (e) {
        console.error("Erro ao analisar JSON:", e);
        this.entries = [];
      }
    } else {
      this.entries = [];
    }
  }

  save() {
    localStorage.setItem("@github-favorites:", JSON.stringify(this.entries));
  }

  async addFavorite(username) {
    const userExists = this.entries.find((entry) => entry.login === username);
    if (userExists) {
      alert("User already exists on your favorites list");
      return;
    }

    try {
      const user = await GithubUser.search(username);
      if (!user.login) {
        alert("User not found");
        return;
      }

      this.entries.unshift(user); // Adiciona no início para exibir mais recentes primeiro
      this.render();
      this.saveFavorite();
    } catch (error) {
      alert(error.message);
    }
  }

  remove(user) {
    this.entries = this.entries.filter((entry) => entry.login !== user.login);
    this.render();
    this.saveFavorite();
    this.checkUserLength();
  }
}

export class viewFavorites extends Favorites {
  constructor(root) {
    super(root);
    this.tbody = this.root.querySelector("tbody");
    this.render();
    this.onAddFavorite();
  }

  onAddFavorite() {
    const addButton = this.root.querySelector(".search button");
    addButton.addEventListener("click", () => {
      const input = this.root.querySelector(".search input");
      const username = input.value.trim();
      if (username) {
        this.addFavorite(username);
        input.value = ""; // Limpa o campo de entrada após adicionar
      }
    });
  }

  render() {
    this.removeAllFavorites();

    this.entries.forEach((user) => {
      const tr = this.createRow(user);
      this.tbody.appendChild(tr);
    });

    this.checkUserLength();
  }

  createRow(user) {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td class="user">
        <img src="https://github.com/${user.login}.png" />
        <a href="https://github.com/${user.login}" target="_blank">
          <p>${user.name}</p>
          <span> /${user.login} </span>
        </a>
      </td>
      <td class="repositories">${user.public_repos}</td>
      <td class="followers">${user.followers}</td>
      <td>
        <button class="btn-remove">Remove</button>
      </td>
    `;

    const removeButton = tr.querySelector(".btn-remove");
    removeButton.addEventListener("click", () => {
      const isOk = confirm(
        `Do you really want to remove ${user.login} from your favorites?`
      );
      if (isOk) {
        this.remove(user);
        alert(`${user.login} was removed from your favorites`);
      }
    });

    return tr;
  }

  removeAllFavorites() {
    this.tbody.innerHTML = ""; // Limpa o conteúdo HTML dentro do tbody
  }
}
