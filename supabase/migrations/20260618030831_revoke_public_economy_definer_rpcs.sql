REVOKE EXECUTE ON FUNCTION public.atomic_add_currency(uuid, text, integer, text)
  FROM public, anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.atomic_spend_currency(uuid, text, integer, text)
  FROM public, anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.grant_currency(uuid, text, integer, text, uuid, text)
  FROM public, anon, authenticated;
