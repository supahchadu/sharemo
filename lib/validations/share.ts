import * as z from 'zod';

export const ShareValidation = z.object({
    share: z.string().nonempty().min(3, { message: "Minimum 3 characters." }),
    accountId: z.string(),
})

export const CommentValidation = z.object({
    share: z.string().nonempty().min(3,{message:'Minimum 3 characters'}),
})