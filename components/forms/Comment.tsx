"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { UserValidation } from "@/lib/validations/user";
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "../ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { updateUser } from "@/lib/actions/user.actions";
import { usePathname, useRouter } from "next/navigation";
import { CommentValidation, ShareValidation } from "@/lib/validations/share";
import { addCommentToShare, createShare } from "@/lib/actions/share.actions";
import Image from "next/image";
import { useState } from "react";

interface Props {
    shareId: string;
    currentUserImg: string;
    currentUserId: string;
}

const Comment = ( {shareId, currentUserImg, currentUserId }: Props) => {
    
    const pathname = usePathname();

    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof CommentValidation>>({
        resolver: zodResolver(CommentValidation),
        defaultValues: {
            share: ''
        }
    });

    const onSubmit = async (values : z.infer<typeof CommentValidation>) => {

        if (isSubmitting) return; // Prevent multiple submissions

        setIsSubmitting(true);

        await addCommentToShare(shareId, values.share,
            JSON.parse(currentUserId), pathname);
  
        form.reset();
    }

    return(
         <Form {...form}>
      <form className='comment-form' onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name='share'
          render={({ field }) => (
            <FormItem className='flex w-full items-center gap-3'>
              <FormLabel>
                <Image
                  src={currentUserImg}
                  alt='current_user'
                  width={48}
                  height={48}
                  className='rounded-full object-cover'
                />
              </FormLabel>
              <FormControl className='border-none bg-transparent'>
                <Input
                  type='text'
                  {...field}
                  placeholder='Comment...'
                  className='no-focus text-light-1 outline-none'
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type='submit' disabled={isSubmitting} className='comment-form_btn'>
          Reply
        </Button>
      </form>
    </Form>
    );
}

export default Comment;