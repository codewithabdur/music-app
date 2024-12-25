import { defineType,defineField } from "sanity";


export default defineType({
    name: "english",
    title: "English",
    type: "document",
    fields: [
        defineField({
            name: "title",
            title: "Title",
            type: "string",
        }),
        defineField({
            name: "description",
            title: "Description",
            type: "text",
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
              source: 'title',
              maxLength: 96,
            },
          }),defineField({
            name: 'copyright',
            title: 'Copyright',
            type: 'string',
          }),
          defineField({
            name: 'language',
            title: 'Language',
            type: 'array',
            of: [{type: 'string'}],
            options: {
              list: [
                {title: 'English', value: 'en'},
                {title: 'Hindi', value: 'hi'},
                {title: 'French', value: 'fr'},
                {title: 'Spanish', value: 'es'},
                // Add more languages as needed
              ],
            },
          }),
          defineField({
            name: 'category',
            title: 'Category',
            type: 'array',
            of: [{type: 'string'}],
          }),
          defineField({
            name: 'file',
            title: 'File',
            type: 'file',
          }),
          defineField({
            name: 'audioimg',
            title: 'audioImg',
            type: 'image',
          }),
          defineField({
            name: 'size',
            title: 'Size',
            type: 'string',
          }),
    ],
})