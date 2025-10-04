"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { UserValidation } from "@/lib/validations/user";
import { z } from "zod"
import { Button } from "@/components/ui/button"
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
import { ShareValidation } from "@/lib/validations/share";
import { createShare } from "@/lib/actions/share.actions";
import { useOrganization } from "@clerk/nextjs";

interface Props {
    userId: string,
}

function PostShare({ userId } : Props)
{
    const router = useRouter();
    const pathname = usePathname();
    const { organization } = useOrganization();

    const form = useForm<z.infer<typeof ShareValidation>>({
        resolver: zodResolver(ShareValidation),
        defaultValues: {
            share: "",
            accountId: userId,
        }
    });

    const onSubmit = async (values : z.infer<typeof ShareValidation>) => {

        await createShare({
            text: values.share,
            author: userId,
            clusterId: organization ? organization.id : null,
            path: pathname
        });

        router.push("/");
    }

    return(
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col justify-start gap-10">
             <FormField
            control={form.control}
            name="share"
            render={({ field }) => (
                <FormItem className="flex flex-col w-full gap-3">
                <FormLabel className="text-base1-semibold text-light-2">
                    Share mo lang?
                </FormLabel>

                <FormControl className="flex-1 text-base-semibold text-gray-200">
                    <Textarea 
                    rows={10}
                    className="account-form_input no focus" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}/>
            <Button type="submit" className="bg-primary-500">Post mo Yern~</Button>
            </form>
        </Form>
    )
}

export default PostShare;