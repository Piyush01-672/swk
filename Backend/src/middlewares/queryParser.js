export const queryParser = (req, res, next) => {
    const query = { ...req.query };
    const mongoQuery = {};

    for (const key in query) {
        let value = query[key];

        // Handle Supabase-style operators: field=gte.100, field=in.(1,2,3)
        if (typeof value === 'string') {
            if (value.startsWith('gte.')) {
                mongoQuery[key] = { $gte: value.replace('gte.', '') };
            } else if (value.startsWith('lte.')) {
                mongoQuery[key] = { $lte: value.replace('lte.', '') };
            } else if (value.startsWith('gt.')) {
                mongoQuery[key] = { $gt: value.replace('gt.', '') };
            } else if (value.startsWith('lt.')) {
                mongoQuery[key] = { $lt: value.replace('lt.', '') };
            } else if (value.startsWith('eq.')) {
                mongoQuery[key] = value.replace('eq.', '');
            } else if (value.startsWith('in.')) {
                // e.g. in.(1,2,3) -> [1,2,3]
                const list = value.replace('in.(', '').replace(')', '').split(',');
                mongoQuery[key] = { $in: list };
            } else if (value.startsWith('is.')) {
                // e.g. is.null -> null
                const val = value.replace('is.', '');
                if (val === 'null') mongoQuery[key] = null;
                else if (val === 'true') mongoQuery[key] = true;
                else if (val === 'false') mongoQuery[key] = false;
            } else {
                // Default to equality if no operator, but handle potential numbers?
                // For now, keep as string or try to parse number if it looks like one?
                // Supabase client sends strings usually.
                // Let's safe-guard: if it's a number-string, maybe we need to convert?
                // The backend logic might need to cast.
                mongoQuery[key] = value;
            }
        } else {
            mongoQuery[key] = value;
        }
    }

    req.mongoQuery = mongoQuery;
    next();
};
