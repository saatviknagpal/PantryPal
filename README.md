# Pantry Pal App

Pantry Pal is a web application that helps users manage their pantry inventory, generate recipes based on available ingredients, and visualize the recipes with images.

## Installation
1. Clone the repository.
2. Install dependencies using `npm install`.
3. Set up environment variables using a `.env` file.
4. Start the development server with `npm run dev`.

## Features
- **Inventory Management**: View and manage pantry items.
- **Recipe Generation**: Generate recipes based on selected ingredients.
- **Image Visualization**: Visualize recipes with images.

## Technologies Used
- Next.js for frontend development.
- Firebase for database management.
- Llama 3.1 API for recipe generation.
- Pollinations AI for image creation.

## File Structure
- `app/page.js`: Contains the frontend code for managing pantry items and displaying inventory.
- `app/recipes/page.js`: Includes the logic for fetching pantry items, generating recipes, and formatting recipe text.

## Usage
1. Add pantry items by searching and selecting from the inventory.
2. Generate recipes by selecting ingredients and clicking the generate button.
3. View the formatted recipe with highlighted key points.

## API Endpoints
- `/api/generate-recipe`: POST endpoint to generate a recipe based on selected ingredients.

## Additional Information
For detailed documentation on API usage and environment variables, refer to the project's codebase and the respective API documentation.