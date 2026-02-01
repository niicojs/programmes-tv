# 📺 Programmes TV

Application web qui affiche les programmes TV du soir pour les chaînes de la TNT française.

## 🌟 Fonctionnalités

- Affichage des programmes de **prime time** pour toutes les chaînes TNT
- Interface moderne et responsive avec **Tailwind CSS**
- Données récupérées depuis [XMLTV.fr](https://xmltvfr.fr/)
- Génération statique avec **Astro** pour des performances optimales
- Mise à jour automatique quotidienne via GitHub Actions

## 🛠️ Technologies

- [Astro](https://astro.build/) - Framework web moderne pour sites statiques
- [TypeScript](https://www.typescriptlang.org/) - Typage statique
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utilitaire
- [fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser) - Parsing des données XMLTV
- [fflate](https://github.com/101arrowz/fflate) - Décompression des fichiers gzip

## 📦 Installation

### Prérequis

- [Node.js](https://nodejs.org/) (version 22+)
- [pnpm](https://pnpm.io/)

### Étapes

```bash
# Cloner le repository
git clone https://github.com/niicojs/programmes-tv.git
cd programmes-tv

# Installer les dépendances
pnpm install
```

## 🚀 Utilisation

### Développement

```bash
pnpm dev
```

L'application sera accessible sur http://localhost:3000

### Build de production

```bash
pnpm build
```

### Prévisualisation du build

```bash
pnpm preview
```

## 📁 Structure du projet

```
programmes-tv/
├── src/
│   ├── components/     # Composants Astro (Header, Footer, etc.)
│   ├── lib/            # Utilitaires et parsing XMLTV
│   ├── pages/          # Pages de l'application
│   └── styles/         # Styles CSS
├── public/             # Assets statiques
└── .github/workflows/  # GitHub Actions pour le déploiement
```

## 🔄 Mise à jour automatique

Le site est automatiquement reconstruit chaque jour grâce à un workflow GitHub Actions (`nightly-build.yml`) pour afficher les programmes à jour.

## 📡 Source des données

Les programmes TV sont récupérés depuis [XMLTV.fr](https://xmltvfr.fr/) qui fournit un flux XMLTV des chaînes TNT françaises.

## 📝 Licence

Ce projet est open source.
