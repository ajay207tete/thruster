import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'

export default defineConfig({
  name: 'default',
  title: 'My Sanity Studio',

  projectId: 'm1wjb3wt',
  dataset: 'production',

  plugins: [deskTool()],

  schema: {
    types: [
      {
        name: 'post',
        type: 'document',
        title: 'Post',
        fields: [
          {
            name: 'title',
            type: 'string',
            title: 'Title'
          },
          {
            name: 'slug',
            type: 'slug',
            title: 'Slug',
            options: {
              source: 'title'
            }
          },
          {
            name: 'content',
            type: 'text',
            title: 'Content'
          }
        ]
      },
      {
        name: 'shop',
        type: 'document',
        title: 'Shop',
        fields: [
          {
            name: 'name',
            type: 'string',
            title: 'Name'
          },
          {
            name: 'description',
            type: 'text',
            title: 'Description'
          },
          {
            name: 'price',
            type: 'number',
            title: 'Price'
          },
          {
            name: 'image',
            type: 'image',
            title: 'Image'
          },
          {
            name: 'sizes',
            type: 'array',
            title: 'Sizes',
            of: [{ type: 'string' }]
          },
          {
            name: 'colors',
            type: 'array',
            title: 'Colors',
            of: [{ type: 'string' }]
          },
          {
            name: 'category',
            type: 'string',
            title: 'Category',
            initialValue: 'clothing'
          },
          {
            name: 'stock',
            type: 'number',
            title: 'Stock',
            initialValue: 0
          }
        ]
      }
    ],
  },
})
