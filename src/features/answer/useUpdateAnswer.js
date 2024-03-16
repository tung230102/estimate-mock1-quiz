import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { apiUpdateAnswer } from "../../api";

export function useUpdateAnswer() {
  const queryClient = useQueryClient();

  const { mutate: updateAnswer, isPending: isLoading } = useMutation({
    mutationFn: ({ id, data }) => apiUpdateAnswer(id, data),
    onSuccess: (res) => {
      if (res && res.statusCode === 200) {
        toast.success(res.message);
      } else if (res && res.status === 400) {
        let errors = res.data.message;
        if (errors && typeof errors !== "string") {
          toast.error(errors[0]);
        } else if (errors) {
          toast.error(errors);
        }
      }
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
    onError: (err) => toast.error(err.message),
  });

  return { isLoading, updateAnswer };
}
